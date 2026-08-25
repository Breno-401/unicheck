const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const settingsPath = require.resolve("../platform/CONFIGURACOES PERFIL/configuracoes.js");
const originalSource = fs.readFileSync(settingsPath, "utf8");
const instrumentedSource = originalSource.replace(
    /\}\)\(\);\s*$/,
    "window.__avatarTest = { optimizeAvatar, validateAvatarFile }; })();"
);

function loadOptimizer({ width, height, outputSize = 128 * 1024 }) {
    const drawCalls = [];
    const canvas = {
        width: 0,
        height: 0,
        getContext: () => ({ drawImage: (...args) => drawCalls.push(args) }),
        toBlob(callback, type, quality) {
            this.outputType = type;
            this.outputQuality = quality;
            callback(new Blob([new Uint8Array(outputSize)], { type }));
        }
    };
    class MockImage {
        set src(value) {
            this.naturalWidth = width;
            this.naturalHeight = height;
            queueMicrotask(() => this.onload());
        }
    }
    const document = {
        readyState: "loading",
        createElement: tag => tag === "canvas" ? canvas : {},
        addEventListener() {}
    };
    const window = {
        addEventListener() {},
        setTimeout,
        clearTimeout
    };
    const URL = {
        createObjectURL: () => "blob:test",
        revokeObjectURL() {}
    };

    vm.runInNewContext(instrumentedSource, {
        Blob,
        File,
        Image: MockImage,
        URL,
        console,
        document,
        window,
        setTimeout,
        clearTimeout
    });

    return {
        optimizeAvatar: window.__avatarTest.optimizeAvatar,
        validateAvatarFile: window.__avatarTest.validateAvatarFile,
        canvas,
        drawCalls
    };
}

for (const fixture of [
    { name: "JPG abaixo de 2 MB", type: "image/jpeg", size: 1_500_000, outputSize: 142_000, width: 1600, height: 1200 },
    { name: "JPG entre 2 e 5 MB", type: "image/jpeg", size: 3_250_000, outputSize: 158_000, width: 2400, height: 3200 },
    { name: "PNG entre 2 e 5 MB", type: "image/png", size: 4_500_000, outputSize: 176_000, width: 3000, height: 1800 }
]) {
    test(fixture.name + " vira avatar WebP quadrado", async () => {
        const { optimizeAvatar, canvas, drawCalls } = loadOptimizer(fixture);
        const original = new File([new Uint8Array(fixture.size)], "original", { type: fixture.type });
        const optimized = await optimizeAvatar(original);

        assert.equal(canvas.width, 512);
        assert.equal(canvas.height, 512);
        assert.equal(canvas.outputType, "image/webp");
        assert.equal(canvas.outputQuality, 0.82);
        assert.equal(optimized.name, "avatar.webp");
        assert.equal(optimized.type, "image/webp");
        assert.ok(optimized.size < 500 * 1024);

        const sourceSize = Math.min(fixture.width, fixture.height);
        assert.deepEqual(drawCalls[0].slice(1), [
            (fixture.width - sourceSize) / 2,
            (fixture.height - sourceSize) / 2,
            sourceSize,
            sourceSize,
            0,
            0,
            512,
            512
        ]);
    });
}

test("imagem acima de 5 MB e formato invalido sao recusados", () => {
    const { validateAvatarFile } = loadOptimizer({ width: 100, height: 100 });
    const tooLarge = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" });
    const invalid = new File([new Uint8Array(10)], "avatar.gif", { type: "image/gif" });

    assert.equal(validateAvatarFile(tooLarge), "A imagem deve ter no máximo 5 MB.");
    assert.equal(validateAvatarFile(invalid), "Use uma imagem JPG, PNG ou WebP.");
});

test("limites, mensagens e destino remoto permanecem explicitos", () => {
    assert.match(originalSource, /MAX_ORIGINAL_AVATAR_SIZE = 5 \* 1024 \* 1024/);
    assert.match(originalSource, /A imagem deve ter no máximo 5 MB\./);
    assert.match(originalSource, /Use uma imagem JPG, PNG ou WebP\./);
    assert.match(originalSource, /user\.id \+ "\/avatar\.webp"/);
    assert.match(originalSource, /\.from\(AVATAR_BUCKET\)[\s\S]*?\.upload\([\s\S]*?upsert: true/);
});
