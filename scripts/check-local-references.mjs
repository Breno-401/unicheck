import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";

const repositoryRoot = resolve(process.cwd());
const ignoredDirectories = new Set([".git", "node_modules"]);
const supportedFiles = new Set([".html", ".css"]);
const referencePatterns = {
  ".html": /(?:src|href)=["']([^"'#?]+)["']/gi,
  ".css": /url\(\s*["']?([^"'?#)]+)["']?\s*\)/gi
};

function collectFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;

    const absolutePath = join(directory, entry);
    const metadata = statSync(absolutePath);

    if (metadata.isDirectory()) {
      files.push(...collectFiles(absolutePath));
    } else if (supportedFiles.has(extname(entry).toLowerCase())) {
      files.push(absolutePath);
    }
  }

  return files;
}

function isExternal(reference) {
  return /^(?:[a-z]+:|\/\/|#|data:)/i.test(reference) || reference.startsWith("/");
}

const missingReferences = [];

for (const sourceFile of collectFiles(repositoryRoot)) {
  const extension = extname(sourceFile).toLowerCase();
  const content = readFileSync(sourceFile, "utf8");
  const pattern = new RegExp(referencePatterns[extension].source, referencePatterns[extension].flags);

  for (const match of content.matchAll(pattern)) {
    const reference = match[1].trim();
    if (!reference || isExternal(reference) || reference.startsWith("var(")) continue;

    const decodedReference = decodeURIComponent(reference);
    const target = normalize(resolve(dirname(sourceFile), decodedReference));

    if (!target.startsWith(repositoryRoot) || !existsSync(target)) {
      missingReferences.push({
        source: relative(repositoryRoot, sourceFile),
        reference,
        target: relative(repositoryRoot, target)
      });
    }
  }
}

if (missingReferences.length) {
  console.error("\nReferências locais inexistentes:\n");
  for (const item of missingReferences) {
    console.error(`- ${item.source}: ${item.reference} -> ${item.target}`);
  }
  console.error(`\nTotal: ${missingReferences.length} referência(s) quebrada(s).\n`);
  process.exit(1);
}

console.log("Todas as referências locais de HTML e CSS apontam para arquivos existentes.");
