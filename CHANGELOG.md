# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0](https://github.com/glaucus-app/app/compare/glaucus-v0.5.1...glaucus-v0.6.0) (2026-06-05)


### Features

* add tech stack security audit document ([4f11afb](https://github.com/glaucus-app/app/commit/4f11afb3a23d93699671e0c34f9699a803a0e80b))
* **audit:** add comprehensive architecture audit document ([#1](https://github.com/glaucus-app/app/issues/1)) ([ea6232c](https://github.com/glaucus-app/app/commit/ea6232cd895486e7a68b124880a587c39f0170c6))
* **docs:** add target system architecture document ([#2](https://github.com/glaucus-app/app/issues/2)) ([bb04780](https://github.com/glaucus-app/app/commit/bb0478026e6f7314a38405e2f8d179d066147db1))


### Bug Fixes

* address refinery review comments on tech stack audit ([16036da](https://github.com/glaucus-app/app/commit/16036da2b44fee71d2115b3fb8db2137c19f8033))
* **gems:** add missing icon fields to 3 gems ([bfdfe3a](https://github.com/glaucus-app/app/commit/bfdfe3aac4bec332fc66c9ed5235f15ff38529b8))

## [0.5.1](https://github.com/Dahgoth/di-lab/compare/di-lab-v0.5.0...di-lab-v0.5.1) (2026-03-09)


### Bug Fixes

* **gems:** fixed gem icons, removed screenshots ([d314a4e](https://github.com/Dahgoth/di-lab/commit/d314a4e5bdb882af4fde1393dd859bd3a6bc588e))

## [0.5.0](https://github.com/Dahgoth/di-lab/compare/di-lab-v0.4.0...di-lab-v0.5.0) (2026-03-07)


### Features

* add gem icon support to UI components ([2f64fa0](https://github.com/Dahgoth/di-lab/commit/2f64fa0bff52291f6b05d421e434988da9ef52e0))
* add shadcn/ui CSS variables for TweakCN compatibility ([df804ec](https://github.com/Dahgoth/di-lab/commit/df804ecc4b15ed198676e7313f650567271c730e))
* add TweakCN dark mode and rounded corners to gems UI ([69e9ca3](https://github.com/Dahgoth/di-lab/commit/69e9ca378420b7f4f39f139e1133f825d235743f))
* add TweakCN live preview script ([d41584b](https://github.com/Dahgoth/di-lab/commit/d41584b24e52d9ac04b654f1be19c1bb5078926a))
* complete CSS variable migration for full TweakCN compatibility ([825b783](https://github.com/Dahgoth/di-lab/commit/825b783b204ae17a0f2885da685e5411382cf61e))
* extract and map gem icons from crafting UI screenshots ([24f27c0](https://github.com/Dahgoth/di-lab/commit/24f27c0f110bf0bdd60d5c71ea80354789a14e22))
* **gems:** extract gem icons from screenshots and add to gems.json ([baba2f8](https://github.com/Dahgoth/di-lab/commit/baba2f8dfc3d632aab42a59aca2ac0c260420ea3))
* **gems:** extract named gem icons from crafting UI screenshots ([2e92841](https://github.com/Dahgoth/di-lab/commit/2e928416734a8a42806e4eeccb56d2cdf077e47f))
* migrate to TweakCN theme with full CSS variable support ([e425b01](https://github.com/Dahgoth/di-lab/commit/e425b010714d3f68b513d6b2ad961ca172ef3431))
* migrate UI components to CSS variables for TweakCN compatibility ([8862892](https://github.com/Dahgoth/di-lab/commit/8862892269ed2fcb2464fc2ed6ff16cb20de8a09))
* migrate UI components to shadcn/ui patterns ([e9b031b](https://github.com/Dahgoth/di-lab/commit/e9b031b9eaf52e41777aef78781a0fb65c023834))
* migrate UI components to use CSS variables for TweakCN compatibility ([62c80f1](https://github.com/Dahgoth/di-lab/commit/62c80f179f10b0ba89fd11ec061a7b2f21dd608c))
* **ui:** apply tactical minimalism design to optimize page ([628e57f](https://github.com/Dahgoth/di-lab/commit/628e57f43d56d0283b41a72a0530b50d69156e22))


### Bug Fixes

* add remaining CSS variables for TweakCN theme compatibility ([22123e9](https://github.com/Dahgoth/di-lab/commit/22123e9cc0cebaba3b2eac01e25b64cab68755d4))
* add tweakcn.com to CSP frame-ancestors ([7880a0a](https://github.com/Dahgoth/di-lab/commit/7880a0a69281d20cf45b18ccc25d13870fca3c20))
* connect star rating tabs to state in optimize page ([8a553bd](https://github.com/Dahgoth/di-lab/commit/8a553bd22e227f3a8211be477d0cc2c9099a7d35))
* convert hardcoded colors to CSS vars for TweakCN ([8c8a27f](https://github.com/Dahgoth/di-lab/commit/8c8a27f52e34857d8ea049eb9b6525e380e56665))
* remove hardcoded tactical minimalism design values from optimize page ([c80a684](https://github.com/Dahgoth/di-lab/commit/c80a68419b141cf9807199a73aa25624c1705227))
* remove TweakCN script (incompatible with non-shadcn/ui project) ([1241501](https://github.com/Dahgoth/di-lab/commit/12415011f5ff650f464c97569a228b3224e2769c))
* replace [@apply](https://github.com/apply) with raw CSS vars for Tailwind 4 compatibility ([d405902](https://github.com/Dahgoth/di-lab/commit/d405902986d1a28d307658af7888ddfcbb7e231d))
* resolve CSS syntax error and add official TweakCN Vercel theme ([6c0b893](https://github.com/Dahgoth/di-lab/commit/6c0b89355d0f52c4cb492dbcc6f32239e95e5351))

## [0.4.0](https://github.com/Dahgoth/di-lab/compare/di-lab-v0.3.0...di-lab-v0.4.0) (2026-03-06)


### Features

* **config:** add csp via middleware with nonce support ([7b94ddc](https://github.com/Dahgoth/di-lab/commit/7b94ddc8a1c4ce4e5f9157784c19d7052b74f510))


### Bug Fixes

* **config:** add exact preview subdomain to frame-ancestors ([fd3d3a0](https://github.com/Dahgoth/di-lab/commit/fd3d3a0ce324d3b5cf3d68831c011b13a4625b5d))
* **config:** add more permissive frame-ancestors patterns ([89e7a3b](https://github.com/Dahgoth/di-lab/commit/89e7a3b7fb19b8bc37f8aaa41ba26a2dc4a41379))
* **config:** add security scope to commitlint ([b9027ce](https://github.com/Dahgoth/di-lab/commit/b9027ce572d4f08b0ef8d89ce5a131c4414d15cf))
* **config:** allow-kilo-code-preview-in-csp-headers ([e770425](https://github.com/Dahgoth/di-lab/commit/e770425ef95bc7525181b9cee8e73d6f6635093a))
* **config:** disable subject-case check in commitlint ([e6f4e17](https://github.com/Dahgoth/di-lab/commit/e6f4e17cb63ef7b14861e883c3e91e61c0d77415))
* **config:** expand-csp-frame-ancestors-for-preview-services ([d85b35d](https://github.com/Dahgoth/di-lab/commit/d85b35daa6e098d9fa8ff056cb08981d9825e874))
* **config:** remove csp - incompatible with next.js nonces ([e548b1e](https://github.com/Dahgoth/di-lab/commit/e548b1eef3c2d517ea383ca6b996d0b3b439d560))
* **config:** remove csp headers to diagnose script blocking ([53771a1](https://github.com/Dahgoth/di-lab/commit/53771a1fc0d5c80ba85505be73b8a1e91fe76bee))
* **config:** restore csp with unsafe-inline for iframe compatibility ([d066465](https://github.com/Dahgoth/di-lab/commit/d0664651ebd76f388b3ad1f74720ffe5f305d064))

## [0.3.0](https://github.com/Dahgoth/di-lab/compare/di-lab-v0.2.2...di-lab-v0.3.0) (2026-02-19)


### Features

* **optimizer:** implement legendary gems optimizer UI (PROJ-002) ([#12](https://github.com/Dahgoth/di-lab/issues/12)) ([5923e17](https://github.com/Dahgoth/di-lab/commit/5923e17e9c622441a99766a76274322f9ead0506))

## [0.2.2](https://github.com/Dahgoth/di-lab/compare/di-lab-v0.2.1...di-lab-v0.2.2) (2026-02-16)


### Bug Fixes

* update metadata and page content for di-lab project ([#10](https://github.com/Dahgoth/di-lab/issues/10)) ([a8bc049](https://github.com/Dahgoth/di-lab/commit/a8bc0494decb74c02403a6fae7d1193a5573d837))

## [0.2.1](https://github.com/Dahgoth/di-lab/compare/di-lab-v0.2.0...di-lab-v0.2.1) (2026-02-14)

### Bug Fixes

- **config:** remove optimizer ui spec from main ([f5e642b](https://github.com/Dahgoth/di-lab/commit/f5e642b6e514d2255d60a2de774acd17e5a22fce))

## [0.2.0](https://github.com/Dahgoth/di-lab/compare/di-lab-v0.1.0...di-lab-v0.2.0) (2026-02-14)

### Features

- **config:** implement template-based naming system ([b524e55](https://github.com/Dahgoth/di-lab/commit/b524e552332e4eb6e1476038f94c2d9cfdb907a1))
- install Spec Kit and update memory bank for DI-Lab ([cc32708](https://github.com/Dahgoth/di-lab/commit/cc32708919593dd2e1eac906fb636b62fde6509c))

### Bug Fixes

- add content to blank home page ([234ad7c](https://github.com/Dahgoth/di-lab/commit/234ad7cbbe006102f1b72a8c14d84ddaaf2032b2))
- **config:** add packages mapping to release-please config ([54666ac](https://github.com/Dahgoth/di-lab/commit/54666ac783181d30538dee0114e8f7bc70cd16a8))
- **config:** configure release-please to use manifest files ([9132285](https://github.com/Dahgoth/di-lab/commit/9132285798f3da288693ba6545a0ac74d46fb7c2))
- **config:** correct release-please config to use v0.1.0 initial version ([2871b31](https://github.com/Dahgoth/di-lab/commit/2871b31a771d7058270043fbd8d0534d9edd2844))
- sync bun.lock with package.json and remove conflicting package-lock.json ([d14d397](https://github.com/Dahgoth/di-lab/commit/d14d3974c9058ac3d3ae4ebe7d6fbb4ab6c09b75))

## [Unreleased]

### Added

- Workflow foundation with conventional commits enforcement
- Release automation via release-please-action
- Pre-commit hooks for code quality
- Commit message validation via commitlint

## [0.1.0] - 2026-02-14

### Added

- Initial project setup with Next.js 16 and React 19
- TypeScript 5.9.x with strict mode
- Tailwind CSS 4 integration
- ESLint configuration
- Memory bank documentation
- Recipe system for common features
- Base Next.js App Router structure
- Basic home page with welcome content
