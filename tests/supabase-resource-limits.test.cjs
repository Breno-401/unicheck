const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const migrationPath = 'Unicheck/supabase/migrations/20260913210000_resource_limits.sql';
const diagnosticPath = 'Unicheck/supabase/diagnostics/20260913_resource_limits.sql';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const uncomment = sql => sql.replace(/--[^\r\n]*/g, '').trim();
const migration = () => uncomment(read(migrationPath));
const functions = sql => [...sql.matchAll(/create or replace function public\.(\w+)\(\)([\s\S]*?)as \$retention\$([\s\S]*?)\$retention\$;/gi)];

test('hardening fornece exatamente uma migration e um diagnóstico dedicados', () => {
    assert.ok(fs.existsSync(path.join(root, migrationPath)), 'migration ainda ausente');
    assert.ok(fs.existsSync(path.join(root, diagnosticPath)), 'diagnóstico ainda ausente');
});

test('avatar exige nome canônico em cada operação e ambos lados de UPDATE', () => {
    const sql = migration();
    for (const operation of ['select', 'insert', 'update', 'delete']) {
        const policy = sql.match(new RegExp(`alter policy "avatars_${operation}_own"[\\s\\S]*?;`, 'i'))?.[0];
        assert.ok(policy, operation);
        assert.match(policy, /on storage\.objects\s+to authenticated/i);
        const predicate = /bucket_id = 'avatars'\s+and name = \(select auth\.uid\(\)\)::text \|\| '\/avatar\.webp'/g;
        assert.equal([...policy.matchAll(predicate)].length, operation === 'update' ? 2 : 1);
        if (operation !== 'insert') assert.match(policy, /using\s*\(/i);
        if (['insert', 'update'].includes(operation)) assert.match(policy, /with check\s*\(/i);
    }
    assert.doesNotMatch(sql, /storage\.foldername|drop policy|grant\s|storage\.buckets/i);
});

test('checks protegem writes sem validar legado e consultam catálogo com tabela exata', () => {
    const sql = migration();
    for (const [table, constraint, expression] of [
        ['user_activity', 'user_activity_context_limit_v1', 'context is null or pg_catalog.char_length(context) <= 1000'],
        ['user_activity', 'user_activity_metadata_limit_v1', 'pg_catalog.octet_length(metadata::text) <= 16384'],
        ['user_notifications', 'user_notifications_destination_limit_v1', 'destination is null or pg_catalog.char_length(destination) <= 500']
    ]) {
        const block = sql.match(new RegExp(`if not exists \\([\\s\\S]*?conname = '${constraint}'[\\s\\S]*?end if;`, 'i'))?.[0];
        assert.ok(block, constraint);
        assert.ok(block.includes(`conrelid = 'public.${table}'::pg_catalog.regclass`));
        assert.ok(block.includes(`add constraint ${constraint}`));
        assert.ok(block.includes(`check (${expression}) not valid`));
        assert.match(block, /from pg_catalog\.pg_constraint/i);
    }
    assert.doesNotMatch(sql, /add constraint if not exists|validate constraint/i);
});

test('retenção é interna, serializada por usuário, posterior ao INSERT e determinística', () => {
    const sql = migration();
    const definitions = functions(sql);
    assert.equal(definitions.length, 2);
    for (const [definition, name, header, body] of definitions) {
        const table = name.includes('activity') ? 'user_activity' : 'user_notifications';
        assert.equal(name, `retain_${table}_100_v1`);
        assert.match(header, /returns trigger\s+language plpgsql\s+security definer\s+set search_path = ''/i);
        assert.match(body, /pg_catalog\.current_setting\('transaction_isolation'\)/);
        assert.match(body, /errcode = '40001'/);
        assert.match(body, new RegExp(`pg_catalog\\.pg_advisory_xact_lock\\(pg_catalog\\.hashtextextended\\('${table}:' \\|\\| new\\.user_id::text, 0\\)\\)`));
        assert.ok(body.indexOf('pg_advisory_xact_lock') < body.indexOf('delete from'));
        assert.match(body, new RegExp(`delete from public\\.${table} as expired`));
        assert.match(body, /expired\.user_id = new\.user_id/);
        assert.match(body, /where candidate\.user_id = new\.user_id\s+order by candidate\.created_at desc, candidate\.id desc\s+offset 100/i);
        assert.match(body, /return new;/i);
        assert.ok(sql.includes(`revoke all on function public.${name}() from public, anon, authenticated;`));
        assert.match(sql, new RegExp(`create trigger ${name}\\s+after insert on public\\.${table}\\s+for each row\\s+execute function public\\.${name}\\(\\);`, 'i'));
        assert.doesNotMatch(body, /execute\s|auth\.jwt|user_metadata/i);
        assert.ok(definition.length > 0);
    }
});

test('instalação não limpa dados, altera ownership/RLS ou concede privilégios', () => {
    const sql = migration();
    let ddl = sql;
    for (const [definition] of functions(sql)) ddl = ddl.replace(definition, '');
    assert.doesNotMatch(ddl, /\b(?:delete\s+from|insert\s+into|update\s+public\.|truncate|drop\s+table|grant|disable\s+row\s+level|owner\s+to)\b/i);
    assert.doesNotMatch(sql, /https?:|dblink|net\.|http\.|copy\s.*program/i);
    assert.match(sql, /^begin;/i);
    assert.match(sql, /commit;$/i);
});

test('diagnóstico contém somente SELECT e inventaria legado e controles sem payload pessoal', () => {
    const sql = uncomment(read(diagnosticPath));
    const statements = sql.split(';').map(value => value.trim()).filter(Boolean);
    assert.ok(statements.length >= 8);
    for (const statement of statements) assert.match(statement, /^select\s/i);
    assert.doesNotMatch(sql, /\b(?:insert|update|delete|drop|alter|create|truncate|grant|revoke|call|do|into)\b|pg_advisory|set_config|dblink|https?:/i);
    for (const expected of ['storage.objects', 'avatar.webp', 'context_length', 'metadata_bytes', 'destination_length',
        'having pg_catalog.count(*) > 100', 'pg_catalog.pg_constraint', 'convalidated', 'pg_catalog.pg_trigger',
        'pg_catalog.pg_proc', 'pg_catalog.pg_policies', 'has_function_privilege', 'aclexplode',
        'information_schema.table_privileges', 'information_schema.column_privileges']) assert.ok(sql.includes(expected), expected);
    assert.doesNotMatch(sql, /select\s+\*|\b(?:email|raw_user_meta_data|foto_url)\b/i);
    assert.doesNotMatch(sql, /select[^;]*\b(?:context|metadata|destination)\s*,/i);
});
