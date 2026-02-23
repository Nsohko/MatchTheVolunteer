/* eslint-disable import/no-extraneous-dependencies */
import { resolve } from 'path';
import { BuildOptions, ServerOptions, build, defineConfig } from 'vite';
import { existsSync, readFileSync } from 'fs';
import react from '@vitejs/plugin-react-swc';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { writeFile } from 'fs/promises';

const PORT = 3000;
const clientRoot = './src/client';
const outDir = './dist';
const serverEntry = 'src/server/index.ts';
const copyAppscriptEntry = './appsscript.json';
const devServerWrapper = './dev/dev-server-wrapper.html';

const clientEntrypoints = [
  {
    name: 'CLIENT - Match The Volunteer',
    filename: 'match-the-volunteer',
    template: 'match-the-volunteer/index.html',
  },
];

const keyPath = resolve(__dirname, './certs/key.pem');
const certPath = resolve(__dirname, './certs/cert.pem');
const pfxPath = resolve(__dirname, './certs/cert.pfx'); // if needed for Windows

const devServerOptions: ServerOptions = {
  port: PORT,
};

// use key and cert settings only if they are found
if (existsSync(keyPath) && existsSync(certPath)) {
  devServerOptions.https = {
    key: readFileSync(resolve(__dirname, './certs/key.pem')),
    cert: readFileSync(resolve(__dirname, './certs/cert.pem')),
  };
}

// If mkcert -install cannot be used on Windows machines (in pipeline, for example), the
// script at scripts/generate-cert.ps1 can be used to create a .pfx cert
if (existsSync(pfxPath)) {
  // use pfx file if it's found
  devServerOptions.https = {
    pfx: readFileSync(pfxPath),
    passphrase: 'abc123',
  };
}

const clientServeConfig = () =>
  defineConfig({
    plugins: [react()],
    server: devServerOptions,
    root: resolve(__dirname, clientRoot, 'match-the-volunteer'),
  });

const clientBuildConfig = ({
  clientEntrypointRoot,
  template,
}: {
  clientEntrypointRoot: string;
  template: string;
}) =>
  defineConfig({
    plugins: [react(), viteSingleFile({ useRecommendedBuildConfig: true })],
    root: resolve(__dirname, clientRoot, clientEntrypointRoot),
    build: {
      sourcemap: false,
      write: false, // don't write to disk
      outDir,
      emptyOutDir: true,
      minify: true,
      rollupOptions: {
        input: resolve(__dirname, clientRoot, template),
      },
    },
  });

const serverBuildConfig: BuildOptions = {
  emptyOutDir: true,
  minify: false, // needed to work with footer
  lib: {
    entry: resolve(__dirname, serverEntry),
    fileName: 'code',
    name: 'globalThis',
    formats: ['iife'],
  },
  rollupOptions: {
    output: {
      entryFileNames: 'code.js',
      extend: true,
      footer: (chunk) => {
        return `(function(g){var m=g.globalThis||g;${chunk.exports.map((fn) => `if(m.${fn})g.${fn}=m.${fn};`).join('')}})(typeof globalThis!=='undefined'?globalThis:typeof self!=='undefined'?self:this);`;
      },
    },
  },
};

const buildConfig = ({ mode }: { mode: string }) => {
  const targets = [{ src: copyAppscriptEntry, dest: './' }];
  if (mode === 'development') {
    targets.push(
      ...clientEntrypoints.map((entrypoint) => ({
        src: devServerWrapper,
        dest: './',
        rename: `${entrypoint.filename}.html`,
        transform: (contents: string) =>
          contents
            .toString()
            .replace(/__PORT__/g, String(PORT))
            .replace(/__FILE_NAME__/g, entrypoint.template),
      }))
    );
  }
  return defineConfig({
    plugins: [
      viteStaticCopy({
        targets,
      }),
      mode === 'production' && {
        name: 'build-client-production-bundles',
        closeBundle: async () => {
          console.log('Building client production bundles...');
          for (const clientEntrypoint of clientEntrypoints) {
            console.log('Building client bundle for', clientEntrypoint.name);
            const buildOutput = await build(
              clientBuildConfig({
                clientEntrypointRoot: clientEntrypoint.filename,
                template: clientEntrypoint.template,
              })
            );
            await writeFile(
              resolve(__dirname, outDir, `${clientEntrypoint.filename}.html`),
              (buildOutput as { output: { source: string }[] }).output[0].source
            );
          }
          console.log('Finished building client bundles!');
        },
      },
    ].filter(Boolean),
    build: serverBuildConfig,
  });
};

// https://vitejs.dev/config/
export default async ({ command, mode }: { command: string; mode: string }) => {
  if (command === 'serve') {
    return clientServeConfig();
  }
  if (command === 'build') {
    return buildConfig({ mode });
  }
  return {};
};
