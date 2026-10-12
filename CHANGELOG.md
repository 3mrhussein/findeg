# Changelog

Auto-generated from git commit history.

Latest commit date: 2026-04-05
Range: HEAD

## [0.2.0](https://github.com/3mrhussein/findeg/compare/v0.1.0...v0.2.0) (2026-10-11)


### ⚠ BREAKING CHANGES

* **backend:** Backend package dependencies have changed
    - Removed: server-only, react, next
    - Added: drizzle-orm, zod, jose, bcryptjs, postgres
* **monorepo:** Monorepo structure requires pnpm and updated workspace commands See specs/001-separate-admin-project/quickstart.md for migration guide

### Added

* **005:** Complete app infrastructure decoupling - backend pure TS, app data layer with Cache Components ([bab28d7](https://github.com/3mrhussein/findeg/commit/bab28d7045475b9a8ee7f0c355779e213365dcb1))
* add dark mode support to product forms and update sidebar menu buttons with cursor-pointer styling ([0c91307](https://github.com/3mrhussein/findeg/commit/0c913074067a0429a58e19e40f8f9cf833c860d9))
* add default empty localized values to product form schema and remove redundant edit form component ([92688a9](https://github.com/3mrhussein/findeg/commit/92688a9c62f6b911ecb8bbff3aa74ec2ee1e3ea1))
* add kill script to terminate processes on ports 3000 and 30001 ([0138f81](https://github.com/3mrhussein/findeg/commit/0138f81d6809e45ba9b94dce90bcb0641ab77e6e))
* Add specifications and implementation plans for fixing storefront type errors and restructuring test pipeline ([d356efc](https://github.com/3mrhussein/findeg/commit/d356efc515d65592c72c90f03784213d1bdd1c61))
* add version-aware Current Session core ([dd3d83b](https://github.com/3mrhussein/findeg/commit/dd3d83b2196827241dedcd16fd7feb740e700562))
* **administration:** expose school supply list operations ([f40cbcd](https://github.com/3mrhussein/findeg/commit/f40cbcd736ca756f226f74f3c5dbce6823e42ff2))
* **administration:** expose school supply list operations ([d33b677](https://github.com/3mrhussein/findeg/commit/d33b6770bfb50fc709cd52dab90d09eb25914ca2))
* **administration:** expose school supply list operations ([e82d824](https://github.com/3mrhussein/findeg/commit/e82d824944df5316f8480e2160bfd3dc8ec65df0))
* advance authorization version for access changes ([09d6053](https://github.com/3mrhussein/findeg/commit/09d6053517268d4bdb97bb87f76e4efc83294a44))
* **agents:** add auto-review-mode skill, dispatch workflow and /auto-review comment command ([5db5545](https://github.com/3mrhussein/findeg/commit/5db5545e13874fc3951cff92ea6e4feb4477b73a))
* **agents:** label PRs 'Claude Reviewed' / 'Codex Reviewed' after a bot run ([07aa42f](https://github.com/3mrhussein/findeg/commit/07aa42f0be1fa6f9da37b532eefd88520ad1d3c1))
* **agents:** review:claude and review:codex labels trigger their own reviewer ([b7b0f58](https://github.com/3mrhussein/findeg/commit/b7b0f582a03a005fed863d581cb8ead34f1fca8f))
* **backend:** add environment config, export verification, and documentation ([fa1482e](https://github.com/3mrhussein/findeg/commit/fa1482e5412c2a8a22320947079e5e42ff0f52bb))
* **backend:** add Zod validation schemas and error classes ([2864a54](https://github.com/3mrhussein/findeg/commit/2864a54c28365a3dbe253e57cf6d9fe285ac95d0))
* **backend:** complete Phase 1 - backend package foundation ([9581d5d](https://github.com/3mrhussein/findeg/commit/9581d5d43e83b91858ec33387232b52bbaafe84c))
* **backend:** implement critical missing components ([17f3062](https://github.com/3mrhussein/findeg/commit/17f30622fab71c510b4eb52f36262569d38333a1))
* **backend:** implement missing Phase 1 components - complete backend foundation ([a247a49](https://github.com/3mrhussein/findeg/commit/a247a49123f8b99c73e7ba6c738e1183d516dc5b))
* **backend:** migrate to pure TypeScript with Clean Architecture ([9c72219](https://github.com/3mrhussein/findeg/commit/9c7221995336e6271fe8eb1e47f9a6e0a39727f1))
* **backend:** migrate to pure TypeScript with Clean Architecture ([d95c174](https://github.com/3mrhussein/findeg/commit/d95c174911b9b90a1b4185339ac1c6437dfeb136))
* **backend:** staff create and edit business partners ([b2a8b51](https://github.com/3mrhussein/findeg/commit/b2a8b51b22e514f24f3bb813873f74de8ee8c068))
* **backend:** staff create and edit business partners ([1514798](https://github.com/3mrhussein/findeg/commit/1514798acf319d6651e577cfa0ee7668ac60dbc5)), closes [#178](https://github.com/3mrhussein/findeg/issues/178)
* **cart:** separate the Cart from List Selections ([850d64b](https://github.com/3mrhussein/findeg/commit/850d64b3efe5972524be7a685d017ce16fd9211d))
* **cart:** separate the Cart from List Selections ([a88d792](https://github.com/3mrhussein/findeg/commit/a88d792672958d84c01451cfd621db425a160f81)), closes [#215](https://github.com/3mrhussein/findeg/issues/215)
* **checkout:** cart checkout from quote to accepted order ([f40ac1e](https://github.com/3mrhussein/findeg/commit/f40ac1ed16bce892d548e8659d6e5bf5153b3417))
* **checkout:** cart checkout from quote to accepted order ([0086015](https://github.com/3mrhussein/findeg/commit/0086015d11ebcd46a88efcc47bf8166ddbbac431)), closes [#238](https://github.com/3mrhussein/findeg/issues/238)
* **checkout:** compute Quote amounts in integer-piaster BigInt ([d1f9270](https://github.com/3mrhussein/findeg/commit/d1f927092f30d8dd736796bf1eef1be206d96be3))
* **checkout:** compute Quote subtotal, shipping and total in integer-piaster BigInt ([c162807](https://github.com/3mrhussein/findeg/commit/c1628079e7ce882613b4a79a9cc74df3b88cb263)), closes [#266](https://github.com/3mrhussein/findeg/issues/266)
* **checkout:** idempotent order acceptance ([ccbf799](https://github.com/3mrhussein/findeg/commit/ccbf799d91753f82cba8410266e7ccc001744694))
* **checkout:** idempotent order acceptance ([ea01f23](https://github.com/3mrhussein/findeg/commit/ea01f23cd66f68f554b43ae2fd41dd1dd2e1b6f3)), closes [#239](https://github.com/3mrhussein/findeg/issues/239)
* **checkout:** list checkout with attribution ([3f49c3f](https://github.com/3mrhussein/findeg/commit/3f49c3f98e003482269d01c35110066fbf212e48))
* **checkout:** list checkout with attribution ([2e61d2e](https://github.com/3mrhussein/findeg/commit/2e61d2e914540df90b3b571fe96a1f4f9a9eadc0))
* **checkout:** price list offers on quote and freeze on order ([f32b01b](https://github.com/3mrhussein/findeg/commit/f32b01b4d778a033c30e6979db86b8d69b08431d))
* **checkout:** price list offers on quote and freeze on order ([97a8b02](https://github.com/3mrhussein/findeg/commit/97a8b02f45983fce141b67c15b8371deecdc9864))
* **checkout:** restore 24h idempotency retention per ADR-0005 ([5caf13b](https://github.com/3mrhussein/findeg/commit/5caf13bcded8cc8ca4b57b40d32fa9f92f3e7d15))
* **ci:** add CI plan and verdict decisions to the policy module ([cd9dddf](https://github.com/3mrhussein/findeg/commit/cd9dddf4e52d327a7e0b3575666fddd7440d6a80)), closes [#316](https://github.com/3mrhussein/findeg/issues/316)
* **ci:** add CI policy module for branch rules ([3db217d](https://github.com/3mrhussein/findeg/commit/3db217da9889f687a54da172759361cc1d01454b)), closes [#315](https://github.com/3mrhussein/findeg/issues/315)
* **ci:** add manual review triggers and auto-review toggle mode ([8e9a76c](https://github.com/3mrhussein/findeg/commit/8e9a76cac94ae2567b5844ee6e74bf6a98ae7b68))
* **ci:** print a prefilled "Open the PR" link on push ([564fb7e](https://github.com/3mrhussein/findeg/commit/564fb7e391147db30da32619d0ed4822f822dab8))
* **ci:** run the fast tier on develop merges, strict only for direct pushes ([dfa914d](https://github.com/3mrhussein/findeg/commit/dfa914d7e3e293ad701a4d1a6a4e3a512a15b203))
* **ci:** run the full suite for hotfixes on develop and ticked manual runs ([49f970c](https://github.com/3mrhussein/findeg/commit/49f970c936dd9bf6997c948325c1d18db2da17c4))
* complete Phase 0 setup - monorepo infrastructure, package exports, i18n config ([e9b0647](https://github.com/3mrhussein/findeg/commit/e9b064735d1b783e6f3dfb0b7e97042845bf7f75))
* **dashboard:** display exact Order line discounts ([ca21720](https://github.com/3mrhussein/findeg/commit/ca2172064207fc33f72e36da8130e11d37645a7e))
* **dashboard:** Phase 3 build configuration and verification ([ff9b777](https://github.com/3mrhussein/findeg/commit/ff9b777a1c1a0f725f514f5567478eba5b583f7c))
* **dashboard:** Phase 3 completion - Cypress E2E migration and assets ([295f7e6](https://github.com/3mrhussein/findeg/commit/295f7e6fa85daa5f18d08ee3689ac7def98fd9bd))
* **dashboard:** Phase 3 initial migration - admin feature and configuration ([e53e4ac](https://github.com/3mrhussein/findeg/commit/e53e4ac63b39a87491570d97d004729c719b5a8d))
* **domain-errors:** shared domain errors and connection-free outbox producer entry ([#372](https://github.com/3mrhussein/findeg/issues/372)) ([11bd1fa](https://github.com/3mrhussein/findeg/commit/11bd1fa234cc2e29fb053a9e97b81097aa5e708c))
* enhance frontend quality workflow with PostgreSQL service and database migration steps ([8d00646](https://github.com/3mrhussein/findeg/commit/8d00646ffe1f45b0cc50cb99a08595555876fb05))
* formalize client-safe/server-only barrel split for order and core ([#132](https://github.com/3mrhussein/findeg/issues/132)) ([aa64810](https://github.com/3mrhussein/findeg/commit/aa64810ffb6d1ff04ff3ca052221896ea9139ef4))
* **guest-access:** add guest order access by emailed one-time code ([00a2d89](https://github.com/3mrhussein/findeg/commit/00a2d8939f1d6b2709e84e950628283723182d09))
* **guest-access:** guest order access by emailed one-time code ([023d0ef](https://github.com/3mrhussein/findeg/commit/023d0ef6580c03e7ba8da4ea7e7f8b8fe89e8cce))
* implement cached session retrieval for authentication ([8396c8a](https://github.com/3mrhussein/findeg/commit/8396c8add38278223cffeb397e7eb874c1237e12))
* Implement cascading category picker and enhance category management in admin dashboard ([017553a](https://github.com/3mrhussein/findeg/commit/017553ad542a2feec3b447940ec4151bb2eba90f))
* Implement checkout flow, add Cypress E2E tests for shop and admin, and refactor product and header components. ([93e07c2](https://github.com/3mrhussein/findeg/commit/93e07c242a133638a3d8cdfce05276da97bc4f7e))
* Implement checkout flow, enhance product detail pages, and redesign the shop homepage with new components. ([f7a5f0c](https://github.com/3mrhussein/findeg/commit/f7a5f0c7a9b83e925d7f31a75742b028ddb3fb5b))
* Implement comprehensive admin dashboard UI with new components for products, orders, categories, and shared table utilities. ([f9ca176](https://github.com/3mrhussein/findeg/commit/f9ca176f805d4200cc953863ca0059d7f44cc47a))
* Implement comprehensive admin panel features for product, brand, order, and inventory management, and expand API endpoints for cart, checkout, authentication, and logging. ([f22f13a](https://github.com/3mrhussein/findeg/commit/f22f13a8b20186e72bf6e1d9290d88521c19866d))
* Implement comprehensive admin product, user, and inventory management, enhance cart and filtering, and refactor dashboard components. ([18fd4c8](https://github.com/3mrhussein/findeg/commit/18fd4c8110c768b7013681cda0f076523a1ca2c9))
* implement comprehensive brand management in the admin dashboard with new UI components, services, and API endpoints. ([964fd9b](https://github.com/3mrhussein/findeg/commit/964fd9b8bf8240f0d33ec7edbe73374f2d1fa11f))
* Implement comprehensive catalog management with new collections, tags, inventory, and school list features, including API endpoints, persistence, and seed data. ([97634d6](https://github.com/3mrhussein/findeg/commit/97634d63e751ecccab86f7f90cf219c52e93c396))
* Implement new identity and authentication system, expand admin panel features, and refine core UI components. ([3503736](https://github.com/3mrhussein/findeg/commit/3503736ac45e5c26f8106b3e376aa1e2c19ec4cc))
* Implement new user role system with `portalRole` and drop translation-related fields, alongside refactoring authentication logic and user entities. ([c6c6e83](https://github.com/3mrhussein/findeg/commit/c6c6e8380bec7fa8f62322a36a370ff767a379c9))
* Implement Partial Prerendering for the shop page, introduce new user account pages, and refactor i18n navigation and admin layouts. ([28e08b8](https://github.com/3mrhussein/findeg/commit/28e08b85ef3414ab8e9ef990cac66073bedf5079))
* Implement school list directory and access, product import, review helpful votes, search analytics, and new UI components. ([5de665f](https://github.com/3mrhussein/findeg/commit/5de665f90d538e0ab5d1f060db54b85f0043e72b))
* implement user profile update functionality and reorganize action imports ([183d2c8](https://github.com/3mrhussein/findeg/commit/183d2c8bbc53dc1a1aa9156d920bc5334a589d54))
* Implement variant pricing, refactor storefront components, and update core features and documentation. ([ae90438](https://github.com/3mrhussein/findeg/commit/ae90438335593c58b444faffb004783cc7fe636d))
* Introduce new admin features for tag and collection management, enhance the catalog domain model with value objects, and apply schema migrations. ([636061b](https://github.com/3mrhussein/findeg/commit/636061b257b49682abcf3533bfad3e06378dfe63))
* Introduce WebMCP integration and refactor i18n message structure into domain-specific files with new validation scripts. ([659b8f0](https://github.com/3mrhussein/findeg/commit/659b8f09b0025596b4e3fbacf6a0bd30bfcc941e))
* **inventory:** add Stock Reservation schema and primitives ([5f3e745](https://github.com/3mrhussein/findeg/commit/5f3e7457c98e979493c0cdf16866573806f1840b))
* **inventory:** add Stock Reservation schema and primitives ([88e1b66](https://github.com/3mrhussein/findeg/commit/88e1b66df129938422856369b40283b2d4c68e95)), closes [#237](https://github.com/3mrhussein/findeg/issues/237)
* **money:** extract exact Money conversions into @findeg/money ([#371](https://github.com/3mrhussein/findeg/issues/371)) ([26e9fb4](https://github.com/3mrhussein/findeg/commit/26e9fb49f7149f0385362c9f571c33aa7977cca1)), closes [#365](https://github.com/3mrhussein/findeg/issues/365)
* **monorepo:** complete Phase 0-4 migration and Phase 5-6 optimizations ([5a41615](https://github.com/3mrhussein/findeg/commit/5a416158f3f833517624c626304ccc09c85b8086))
* narrow catalog feature's public backend API to a barrel ([#122](https://github.com/3mrhussein/findeg/issues/122)) ([497628c](https://github.com/3mrhussein/findeg/commit/497628cec0118b7e0546ce6838d769b438044bff))
* narrow identity feature's public backend API to a barrel ([#115](https://github.com/3mrhussein/findeg/issues/115)) ([8324c41](https://github.com/3mrhussein/findeg/commit/8324c41c4ec02520ac954d9fe9e18be0a9545dce))
* narrow media feature's public backend API to a barrel ([#102](https://github.com/3mrhussein/findeg/issues/102)) ([666abc9](https://github.com/3mrhussein/findeg/commit/666abc92dd1c371786d7436d80eb8111e19b2ecd))
* narrow notifications feature's public backend API to a barrel ([#114](https://github.com/3mrhussein/findeg/issues/114)) ([85f2fc4](https://github.com/3mrhussein/findeg/commit/85f2fc4bb1b76852fd1c6be50950b8c705a1132e))
* **order:** forbid refunds before delivery and allow cancelling shipped Orders ([34b3da2](https://github.com/3mrhussein/findeg/commit/34b3da2daf09c50513e3b2c41b5b5126c67357eb))
* **order:** forbid refunds before delivery and allow cancelling shipped Orders ([27b076a](https://github.com/3mrhussein/findeg/commit/27b076a2e6a8085d80ae5b06866e6b9a3127f7e5)), closes [#301](https://github.com/3mrhussein/findeg/issues/301)
* **orders:** centralize status transitions ([adb1425](https://github.com/3mrhussein/findeg/commit/adb1425d5b4c6785bfe054d112179a58cb84cf05))
* **orders:** centralize status transitions ([e839c11](https://github.com/3mrhussein/findeg/commit/e839c110010e035d16407b417bb35b1a35568b9c))
* **orders:** complete Cairo statistics and migrate Dashboard ([37e96b4](https://github.com/3mrhussein/findeg/commit/37e96b4f6edfd97aa3233c04068c14184ade420d))
* **orders:** complete statistics and public package migration ([379ab9f](https://github.com/3mrhussein/findeg/commit/379ab9fbe4b7307dbb60ff33c1bd5595213654cf))
* **orders:** extract atomic Orders workspace package ([#377](https://github.com/3mrhussein/findeg/issues/377)) ([3166251](https://github.com/3mrhussein/findeg/commit/316625149545abfea88c31df45feb83e084b0d10))
* **orders:** extract atomic Orders workspace package ([#377](https://github.com/3mrhussein/findeg/issues/377)) ([901324a](https://github.com/3mrhussein/findeg/commit/901324a46aca07d7aa09398491367db0cd93db7c))
* **orders:** record and enforce Orders package boundary (ADR-0016) ([#370](https://github.com/3mrhussein/findeg/issues/370)) ([94f65e8](https://github.com/3mrhussein/findeg/commit/94f65e83bf5e623870f830b28284f1b23809fbc9))
* **orders:** status emails via outbox and exhausted-outbox retry ([9ffdbae](https://github.com/3mrhussein/findeg/commit/9ffdbaea7e667eab96e2bb053793932e9435dffd))
* **orders:** status emails via outbox and exhausted-outbox retry on Dashboard ([12772f0](https://github.com/3mrhussein/findeg/commit/12772f09ce4e9ed5ae4c05cc2178fe406203b880)), closes [#245](https://github.com/3mrhussein/findeg/issues/245)
* **outbox:** add general outbox and reliable order confirmation email ([98169b6](https://github.com/3mrhussein/findeg/commit/98169b65bea00333f2a32405f2635cb7d2a046e4)), closes [#244](https://github.com/3mrhussein/findeg/issues/244)
* **outbox:** outbox core and confirmation email ([f93a785](https://github.com/3mrhussein/findeg/commit/f93a785c601157d1ec1d9fc5d0747cf4511106d1))
* **partner-membership:** accept invitations into workspaces ([841c257](https://github.com/3mrhussein/findeg/commit/841c257fcff1c80b51a81c58d38260ec6e85433b))
* **partner-membership:** accept invitations into workspaces ([a69cf57](https://github.com/3mrhussein/findeg/commit/a69cf579d4331713051de8854fb28d2b8af83000))
* **partner-membership:** admins manage invitations ([e638733](https://github.com/3mrhussein/findeg/commit/e638733a8b8805d6976ffd1e22e895ffb476ec27))
* **partner-membership:** admins manage invitations ([5dae43a](https://github.com/3mrhussein/findeg/commit/5dae43a87a006f33d04656abe8d7f27c15062578))
* **partner-membership:** admins manage memberships ([9e5352d](https://github.com/3mrhussein/findeg/commit/9e5352d15f1c7e20bb1fb938539089511728fe41))
* **partner-membership:** admins manage memberships ([e0978eb](https://github.com/3mrhussein/findeg/commit/e0978eb2cbc29c206da5c7a4f2e373adb48f29ae))
* **partner-membership:** deliver Partner Invitation emails through the Outbox ([5fefd2e](https://github.com/3mrhussein/findeg/commit/5fefd2e2b6abc2ab3c49a62b397934dd747506c1))
* **partner-membership:** deliver Partner Invitation emails through the Outbox ([8353d6e](https://github.com/3mrhussein/findeg/commit/8353d6e90902a59b7e32b1fd80a71eecbad7d39f)), closes [#268](https://github.com/3mrhussein/findeg/issues/268)
* **partner-membership:** enforce partner workspace access rules and navigation ([1c9a3b6](https://github.com/3mrhussein/findeg/commit/1c9a3b6ecf7ec622e079211274195f92861ea736))
* **partner-membership:** enforce partner workspace access rules and navigation ([32e33f2](https://github.com/3mrhussein/findeg/commit/32e33f260589791efbd6158d118b56d00a3c467a))
* **partner-membership:** staff change Business Partner status ([1484d24](https://github.com/3mrhussein/findeg/commit/1484d2459289400d4e33298ebb4b3cea97a710b2))
* **partner-membership:** staff change Business Partner status ([acf484f](https://github.com/3mrhussein/findeg/commit/acf484fb8f98dc00624e6d6b47ce7f0e968f13ad))
* **partner-membership:** staff invite Partner Administrators and copy invitation links ([de1b725](https://github.com/3mrhussein/findeg/commit/de1b725a61abfd382873d07f3458807058db5ff2))
* **partner-membership:** staff invite Partner Administrators and copy invitation links ([4d46cf9](https://github.com/3mrhussein/findeg/commit/4d46cf9f7112fc9f2e74a10af68fc90e02cb668d))
* **partner-membership:** staff manage partner memberships from the dashboard ([8c44a67](https://github.com/3mrhussein/findeg/commit/8c44a67dc02b316dff9f0585561f6a652d9768df))
* **partner-membership:** staff manage partner memberships from the dashboard ([b117d45](https://github.com/3mrhussein/findeg/commit/b117d455c2b10dd51e4f554478ab95b7b4e036df)), closes [#185](https://github.com/3mrhussein/findeg/issues/185)
* **phase-2:** complete shared code management verification workflow ([bc3ccc6](https://github.com/3mrhussein/findeg/commit/bc3ccc6a7d801c4f8d17494ab485b9e7ae6da303))
* Refactor header into modular components and add product translation fetching for admin editing. ([81fa6f1](https://github.com/3mrhussein/findeg/commit/81fa6f1deeb43cf5ab2913bb5aedeec7a3d10a0c))
* refactor product and tag management with a new tabbed form interface, enhanced API validation, and updated service layer architecture. ([e21e439](https://github.com/3mrhussein/findeg/commit/e21e439948c1e7ac1c0868dcb837e1cc48760d3a))
* reorganize and implement identity management queries ([d30c801](https://github.com/3mrhussein/findeg/commit/d30c801702f3a1422fed1926354ac6fa15532c5b))
* reorganize DTOs and update imports across administration and catalog features ([6381263](https://github.com/3mrhussein/findeg/commit/63812632269187115bc134981c963fe378e0ce28))
* **rewards:** add adjustments and signed Available Balance ([d1a9780](https://github.com/3mrhussein/findeg/commit/d1a978090230a14495489ed5086179d845c2f6fd))
* **rewards:** add adjustments and signed Available Balance ([156d636](https://github.com/3mrhussein/findeg/commit/156d63654f0258f0427f1aa538b522fc022efe08)), closes [#276](https://github.com/3mrhussein/findeg/issues/276)
* **rewards:** add monthly Reward Statement and Staff report projection ([fd07bf4](https://github.com/3mrhussein/findeg/commit/fd07bf41e0eff34f4bb78a663ec2d28231891bff))
* **rewards:** add monthly Reward Statement and Staff report projection ([5f21f6b](https://github.com/3mrhussein/findeg/commit/5f21f6bc3e9d9009f4a689ff438bbb90a6f58b39)), closes [#278](https://github.com/3mrhussein/findeg/issues/278)
* **rewards:** add Partner Reports in the Partner Workspace ([fa82ed7](https://github.com/3mrhussein/findeg/commit/fa82ed7b195078af32186abcd0af17c2215ae7e9))
* **rewards:** add Partner Reports in the Partner Workspace ([2b80fe1](https://github.com/3mrhussein/findeg/commit/2b80fe153294d86757baab1a0e764cff202f8c5c)), closes [#279](https://github.com/3mrhussein/findeg/issues/279)
* **rewards:** add payment transition and earn-on-paid ([0e294ea](https://github.com/3mrhussein/findeg/commit/0e294ea4babb8274e44f8a8de2bff12355bcf15c))
* **rewards:** add payment transition and earn-on-paid ([00a8ebb](https://github.com/3mrhussein/findeg/commit/00a8ebb57034893206777b2301ffafb2fe41167c))
* **rewards:** add Reward Rate ledger foundation ([08fb119](https://github.com/3mrhussein/findeg/commit/08fb119de5b2646592dc42d9aa390902da31644b))
* **rewards:** add Reward Rate ledger foundation ([8a4a716](https://github.com/3mrhussein/findeg/commit/8a4a716b044ae717786f4560a5cfecb9c836dc0a))
* **rewards:** add settlements, voids and debt forgiveness ([90adbad](https://github.com/3mrhussein/findeg/commit/90adbadd7a9c0a7b5072dc48c0ed7b60007f388d))
* **rewards:** add settlements, voids and write-offs ([df53450](https://github.com/3mrhussein/findeg/commit/df5345019d67fd35171e8c8279f45e50707b3748)), closes [#277](https://github.com/3mrhussein/findeg/issues/277)
* **rewards:** create entitlements at Order Acceptance ([dfa08e3](https://github.com/3mrhussein/findeg/commit/dfa08e36a10d075652bdd0aa2b70d023e6105b77)), closes [#273](https://github.com/3mrhussein/findeg/issues/273)
* **rewards:** entitlements at Order Acceptance ([7dbc781](https://github.com/3mrhussein/findeg/commit/7dbc781cdd14f08313608d1e84b601310737e7d5))
* **rewards:** void or reverse rewards on cancellation and refund ([aa6997f](https://github.com/3mrhussein/findeg/commit/aa6997f01bf28571b24e0ffc6fdd83efdf06a9fb))
* **rewards:** void or reverse rewards on cancellation and refund ([0348c88](https://github.com/3mrhussein/findeg/commit/0348c88ad0903a5e91e4f69309f3fca5d74fe448)), closes [#275](https://github.com/3mrhussein/findeg/issues/275)
* **schema:** add @findeg/schema as the Business Domain Schema source of truth ([#382](https://github.com/3mrhussein/findeg/issues/382)) ([6c76443](https://github.com/3mrhussein/findeg/commit/6c764434cf783c7991471cf17126b38884a52855))
* **school:** apply Business Partner Status rules to School Supply Lists ([49a0a82](https://github.com/3mrhussein/findeg/commit/49a0a820be00791ccd65345ca65a03ba843de076))
* **school:** apply Business Partner Status rules to School Supply Lists ([0ea54ce](https://github.com/3mrhussein/findeg/commit/0ea54cec7cc3fda63005ccd8f12b44c24f4ee0c3)), closes [#299](https://github.com/3mrhussein/findeg/issues/299)
* **school:** implement School Supply List lifecycle ([dca143c](https://github.com/3mrhussein/findeg/commit/dca143cfc6aa99c61b2633619b2d06f91bc73a59))
* **school:** implement School Supply List lifecycle ([ce3a515](https://github.com/3mrhussein/findeg/commit/ce3a5155d3fcc2dc0942aea74bcc8ee6e4b1cf78)), closes [#210](https://github.com/3mrhussein/findeg/issues/210)
* **school:** open a published School Supply List by public code ([553bb82](https://github.com/3mrhussein/findeg/commit/553bb8297beceda6f0c1e5a13c92389ad1096589))
* **school:** open a published School Supply List by public code ([fbb1b70](https://github.com/3mrhussein/findeg/commit/fbb1b705dde644bb7a21d46034e971e63996b39e)), closes [#212](https://github.com/3mrhussein/findeg/issues/212)
* **school:** shared variant eligibility for School Supply List items ([1923914](https://github.com/3mrhussein/findeg/commit/192391478471862497b124e9a6e28823ce84313a))
* **school:** shared variant eligibility for School Supply List items ([0699600](https://github.com/3mrhussein/findeg/commit/069960078521d2c804024ad418fdbc33dcc4deed)), closes [#208](https://github.com/3mrhussein/findeg/issues/208)
* Sort brands by ID and improve BrandCard layout with flexed status badges and always-visible action icons. ([927a004](https://github.com/3mrhussein/findeg/commit/927a0044a3a5af9929d3aa63309d4bd29c3f6aa1))
* **storefront:** advisory List Completeness ([9ef1707](https://github.com/3mrhussein/findeg/commit/9ef1707ab42c77427c04f8bfa1e280a3bc04bbd9))
* **storefront:** advisory List Completeness ([0d560d1](https://github.com/3mrhussein/findeg/commit/0d560d11180d3b86fc060715055d04a5d11b0ab2)), closes [#214](https://github.com/3mrhussein/findeg/issues/214)
* **storefront:** apply PLP filters, sort and pagination; restore listing coverage ([#362](https://github.com/3mrhussein/findeg/issues/362)) ([db831c5](https://github.com/3mrhussein/findeg/commit/db831c5d1f5aa2dfcd5d1f2565f92943f3d15c5c))
* **storefront:** fill a list with a client-held List Selection ([2f9987c](https://github.com/3mrhussein/findeg/commit/2f9987cb57f211cd40f2c91e338d10ec43c8abc5))
* **storefront:** fill a list with a client-held List Selection ([c830a05](https://github.com/3mrhussein/findeg/commit/c830a057dc5469e0b03948a1b64d66398fb90fe7)), closes [#213](https://github.com/3mrhussein/findeg/issues/213)
* **storefront:** handle checkout acceptance failures ([2ac72b1](https://github.com/3mrhussein/findeg/commit/2ac72b11d576317ae6855327f87e082a953f0b7f))
* **storefront:** handle checkout acceptance failures ([0d76fe5](https://github.com/3mrhussein/findeg/commit/0d76fe54173aee64d0ad09a8b8d9b76896f60a8b)), closes [#240](https://github.com/3mrhussein/findeg/issues/240)
* **storefront:** Phase 4 migration - features, configuration, and Cypress ([409bdf0](https://github.com/3mrhussein/findeg/commit/409bdf0a002cd20dc2be6ed9837085d1a6906530))
* **ui:** add new components including Skeleton, Slider, SubmitButton, Switch, Table, Tabs, Textarea, Toast, Toaster, and Tooltip ([b9b7818](https://github.com/3mrhussein/findeg/commit/b9b7818ad9a5e628b8bc52f23cab9d281f3cbb1a))
* **ui:** Refined component analysis and restructuring for shared UI packages ([98d219b](https://github.com/3mrhussein/findeg/commit/98d219b3cb16e056080d46510c81894bfae99eb8))
* update database schema, migrate seeds, and implement new backend seeding scripts ([32c547c](https://github.com/3mrhussein/findeg/commit/32c547ce4c8e7f72e5c532c00fd740e990c55d35))


### Fixed

* activate TS/TSX linting across all eslint consumers, downgrade legacy findings to warn ([#124](https://github.com/3mrhussein/findeg/issues/124)) ([c87295d](https://github.com/3mrhussein/findeg/commit/c87295d15a8dac34b2197c4b3ae8d560b34983c0))
* add ESLint configuration and dependencies to dashboard and storefront ([45c24ad](https://github.com/3mrhussein/findeg/commit/45c24adec3688102544d21163f845016c7ace662))
* **administration:** address school list review ([f889f51](https://github.com/3mrhussein/findeg/commit/f889f5193f1b1e4947ee43d50ac1c1cbb8db0eaa))
* **administration:** address school supply list review findings ([0ef37a7](https://github.com/3mrhussein/findeg/commit/0ef37a79631f6c457fc7b95f0995a2ad986fd7a0))
* **agents:** job-level concurrency, env-passed inputs, dispatch checks out PR head ([8141eb8](https://github.com/3mrhussein/findeg/commit/8141eb88c6953060996f16af8eed2967b451f42c))
* **backend:** move createLogger to a server-only entry point ([59894cb](https://github.com/3mrhussein/findeg/commit/59894cb742787bec98ac36027359c01daad3f455))
* **build:** audit generated Turbopack export forwarders ([f2e33a7](https://github.com/3mrhussein/findeg/commit/f2e33a79103359296c526d91aba3a3d9d1bf667b))
* **cart:** discard archived list entries and drop add-to-cart banner promise ([5c372db](https://github.com/3mrhussein/findeg/commit/5c372db6a37c8394b8d7fe54f0a81a428e56e57f))
* **cart:** drop misleading add-bundle label and localise Remove ([1118a22](https://github.com/3mrhussein/findeg/commit/1118a2275b665c63984264992c30bcf0028f446f))
* **checkout:** address PR review on identity, migration triggers and payment options ([973ffc8](https://github.com/3mrhussein/findeg/commit/973ffc8004cf94d2d300e0d1f124af3462d1137c))
* **checkout:** address review feedback on idempotency handling ([7ed00b8](https://github.com/3mrhussein/findeg/commit/7ed00b8cf78142dc43e7cb5c16f1b564328f7fbf))
* **checkout:** address review feedback on order acceptance tracer ([203e790](https://github.com/3mrhussein/findeg/commit/203e79061300c53b7b6443b67020bc5000e25395))
* **checkout:** detect idempotency unique violation by SQLSTATE and return 409 when still in progress ([56906ca](https://github.com/3mrhussein/findeg/commit/56906ca77ac156e4afa9db4614c6f491cfd416fd))
* **checkout:** fingerprint guest email and stop spurious idempotency key reset ([3f04969](https://github.com/3mrhussein/findeg/commit/3f049691bf0bc8e87ade1ca1c88a20f17d1b84cd))
* **checkout:** guard order deletion at table level and type validate errors ([ee93e34](https://github.com/3mrhussein/findeg/commit/ee93e34153674132f810228694124d82ddb310f4))
* **checkout:** ignore guestEmail when order has authenticated userId ([e4e1304](https://github.com/3mrhussein/findeg/commit/e4e130460947edbbf1be337f61b9ec480f0f25d7))
* **checkout:** map unavailable variant on accept and clean barrel exports ([76319d0](https://github.com/3mrhussein/findeg/commit/76319d0dbc5fd667502d3ca88de17d36b635387d))
* **checkout:** read Idempotency-Key from the header only ([0cb8ab2](https://github.com/3mrhussein/findeg/commit/0cb8ab2cef15a05755f38f546e6e825b9551f324))
* **ci:** fetch history for manual runs and keep PR title overrides in sync ([4415ea1](https://github.com/3mrhussein/findeg/commit/4415ea1d4867e8681a827d3b56eccaabdfb03c5b))
* **ci:** reorder workflow steps to prepare pnpm before setup-node cache ([31a62f9](https://github.com/3mrhussein/findeg/commit/31a62f9ce97276c6cb7ebbbd08a5486cfacc042b))
* **ci:** turn ssh:// remotes into https links in the prefilled PR link ([4876342](https://github.com/3mrhussein/findeg/commit/4876342a32a872ca7533fb6abb2aeba053bbbfa3))
* clear no-undef/no-useless-escape/no-redeclare/no-fallthrough eslint warnings ([#125](https://github.com/3mrhussein/findeg/issues/125)) ([#133](https://github.com/3mrhussein/findeg/issues/133)) ([b229699](https://github.com/3mrhussein/findeg/commit/b22969933724671ede7c2b4b75b97b9732080a2b))
* clear no-unused-vars eslint warnings and restore rule to error ([#140](https://github.com/3mrhussein/findeg/issues/140)) ([7017475](https://github.com/3mrhussein/findeg/commit/7017475e326503c821d44e6d080ae31235f1e795))
* clear no-unused-vars eslint warnings in dashboard ([#125](https://github.com/3mrhussein/findeg/issues/125)) ([#135](https://github.com/3mrhussein/findeg/issues/135)) ([fb15f96](https://github.com/3mrhussein/findeg/commit/fb15f9688e43684951f16503b49d4a51e92b50c8))
* clear no-unused-vars eslint warnings in storefront ([#125](https://github.com/3mrhussein/findeg/issues/125)) ([#134](https://github.com/3mrhussein/findeg/issues/134)) ([cd862c2](https://github.com/3mrhussein/findeg/commit/cd862c208c22f4e446238b16e030eac4a5e7457c))
* complete reviewed Orders app workflows ([6a98b18](https://github.com/3mrhussein/findeg/commit/6a98b18c0c0749839533998e78d6eabbc47a4041))
* **config:** allow the server-only core/logger entry point in frontend lint ([d690021](https://github.com/3mrhussein/findeg/commit/d6900216b782d0ae7154bdc2e607e5d43cc483e0))
* correct i18n request.ts import paths for dashboard and storefront ([e89461a](https://github.com/3mrhussein/findeg/commit/e89461aacf83a4749fa6292c705a29b90422d328))
* **dashboard:** isolate client helpers and expire stale order reads ([4d70fe2](https://github.com/3mrhussein/findeg/commit/4d70fe2af3c428bdf5ae5644ab3bb0aeb06d815f))
* **dashboard:** pass real locale to partner save action ([6216f6d](https://github.com/3mrhussein/findeg/commit/6216f6d2a05dedb887f8682eb993f975d25774a9))
* **dashboard:** show gross Order subtotals before discounts ([e283f55](https://github.com/3mrhussein/findeg/commit/e283f55bb95c997fe8c8c99538e103bc939674f1))
* **db:** claim checkout idempotency key atomically instead of delete-then-insert ([30f417b](https://github.com/3mrhussein/findeg/commit/30f417b987785e6bad3983d1c8ecaf5ec38a68eb))
* **db:** drop unused text import from partners schema ([4ac38b9](https://github.com/3mrhussein/findeg/commit/4ac38b9a72ebd712b2088b9ec1ff120ce7c6db0d))
* **db:** guard business partner code format and name length in the database ([f9b0a1f](https://github.com/3mrhussein/findeg/commit/f9b0a1fcb4b25893ced31b33e9d8426ec090b28c))
* **db:** retry order reference collisions through drizzle's wrapped errors ([cdf2048](https://github.com/3mrhussein/findeg/commit/cdf2048d441e1a51d72bfb2c421321ee8e6fa96b))
* **db:** synchronize sequences after explicit seed IDs ([4006c63](https://github.com/3mrhussein/findeg/commit/4006c634474ba718d16272c41942979c80e06df5))
* enforce unsuppressed dashboard release acceptance ([fdc31c9](https://github.com/3mrhussein/findeg/commit/fdc31c94ae1ee28e7602d2046cf733d7ea4ed884))
* **frontend:** mark the server data layer server-only and fix the Next.js docs path in AGENTS.md ([63735fb](https://github.com/3mrhussein/findeg/commit/63735fbafc53a6baab98d8e9c75cc0154958e38e))
* **frontend:** mark the server data layer server-only and fix the Next.js docs path in AGENTS.md ([385bf0d](https://github.com/3mrhussein/findeg/commit/385bf0da0aef9717238e6c9ea5f842cfa25dee5f))
* harden cross-agent identity and review setup ([6c21cfb](https://github.com/3mrhussein/findeg/commit/6c21cfb9189de2a6ac1492c8d38da3e22402cbc9))
* harden cross-agent identity and review setup ([0a99d19](https://github.com/3mrhussein/findeg/commit/0a99d19726b7e6bd8ff5dd5d51b9fb09ab543ea1))
* keep primitive facades out of database implementation bundles ([070c85a](https://github.com/3mrhussein/findeg/commit/070c85a80cc75a9cac0c00a4bf66b7e7c5a4e86d))
* keep storefront session and locale reads request-scoped ([a6a995c](https://github.com/3mrhussein/findeg/commit/a6a995c0e8550d4714fe81bfbcf5493eaade32f6))
* keep storefront session and locale reads request-scoped ([63a5539](https://github.com/3mrhussein/findeg/commit/63a55391c1409920b41d3792e91319ff905353b2))
* keep storefront session and locale reads request-scoped ([11d6fd4](https://github.com/3mrhussein/findeg/commit/11d6fd4c8aa029dddef4e44efdd678f95a849a33))
* keep storefront session and locale reads request-scoped ([bf832b1](https://github.com/3mrhussein/findeg/commit/bf832b114d585337b9b5e5ae673b1de54b457df3))
* order reference collision retry, outbox barrel imports, drain logging ([adfa9b7](https://github.com/3mrhussein/findeg/commit/adfa9b708839ff46bcd196c6529a77801858a7ac))
* **order:** authorize Dashboard order status and payment writes ([b329550](https://github.com/3mrhussein/findeg/commit/b3295501ca332865130330ce78ce79c71f7e9368))
* **order:** authorize Dashboard order status and payment writes ([c9365a7](https://github.com/3mrhussein/findeg/commit/c9365a700cf3f45881ec011cceee034d63423025))
* **orders:** align lint and frozen-status test with transitionOrderStatus ([04d8763](https://github.com/3mrhussein/findeg/commit/04d8763f701e7480207d7fafc41851a8c9486181))
* **orders:** bound list page size, escape LIKE search, keep legacy discountTotal ([9c3a32a](https://github.com/3mrhussein/findeg/commit/9c3a32a44d450383e5798e52fb745e24db2c2a78))
* **orders:** handle partial bulk updates ([1ae86ee](https://github.com/3mrhussein/findeg/commit/1ae86eef0fe0535d2de40249b9ce48155285891e))
* **outbox:** link status emails to the right order page, document kinds ([88d8c51](https://github.com/3mrhussein/findeg/commit/88d8c511430eac9ddfc64d4baab3c510c708f4ce))
* **outbox:** provide public URL env to integration tests ([b7c6473](https://github.com/3mrhussein/findeg/commit/b7c64736708483fe8d1476582c5ea9f09109605c))
* override tsconfig exclude paths in dashboard and storefront ([7dd73ae](https://github.com/3mrhussein/findeg/commit/7dd73ae3f085c97360958a711fbb263b0a64ff44))
* **partner-membership:** address PR [#201](https://github.com/3mrhussein/findeg/issues/201) re-review findings ([632a6e2](https://github.com/3mrhussein/findeg/commit/632a6e2d24ea782917a8e533dc7542a00232bd5e))
* **partner-membership:** address PR review findings ([a863fd1](https://github.com/3mrhussein/findeg/commit/a863fd1bf72aa01939e726d222634e7b4791c73f))
* **partner-membership:** allow leaving only while the partner is open ([3954a79](https://github.com/3mrhussein/findeg/commit/3954a79be36527fca479872ba58eebf3570db90f))
* **partner-membership:** allow leaving only while the partner is open ([c06d7c3](https://github.com/3mrhussein/findeg/commit/c06d7c32a6e81b4c125147224fff9dcba72d9eb9))
* **partner-membership:** expose the role check through the service interface ([fb8b30d](https://github.com/3mrhussein/findeg/commit/fb8b30d1e2a1953f049f089d909ffb6acbb16ed1))
* **partner-membership:** gate each workspace page and keep db out of the barrel ([05b4904](https://github.com/3mrhussein/findeg/commit/05b4904c0ddbdf6ed33a51e9f6a9cc8047f01604))
* **partner-membership:** keep the invitations list readable while suspended ([4e9ba86](https://github.com/3mrhussein/findeg/commit/4e9ba86caca7950c3073c273abaee692441ed7e6))
* **partner-membership:** pass the open transaction to the invitation enqueue seam ([f3f2a15](https://github.com/3mrhussein/findeg/commit/f3f2a1572445eb78557ca57f752b0f46d1332be4))
* **partner-membership:** resolve PR review findings on staff member management ([04b8088](https://github.com/3mrhussein/findeg/commit/04b8088da558af4fd5701325fe0658e144f96d00))
* **partner-membership:** restore last-administrator and keep status policy behind the service ([3abcd10](https://github.com/3mrhussein/findeg/commit/3abcd10545b42316d66c3224f49bd23b5256973d))
* **partner-membership:** revalidate account state for partner sessions ([e24646b](https://github.com/3mrhussein/findeg/commit/e24646b4d70b75c4a8eac18e73b11c3076a2ef22))
* **partner-membership:** scope resend and revoke to the workspace partner in the service ([b219ee0](https://github.com/3mrhussein/findeg/commit/b219ee02736d3e910db721753c982d8f92a0368a))
* **partner-sales:** address PR [#306](https://github.com/3mrhussein/findeg/issues/306) review findings ([3599bcf](https://github.com/3mrhussein/findeg/commit/3599bcfb16c4198d237f4c9d069a99e72874fef6))
* reject sessions signed with a retired portal role ([f3b35fa](https://github.com/3mrhussein/findeg/commit/f3b35fab653a1cb1b3b40437b8ce8f881d275cbd)), closes [#177](https://github.com/3mrhussein/findeg/issues/177)
* **rewards:** address implementation review ([5fba997](https://github.com/3mrhussein/findeg/commit/5fba997b7524dbeac229922c6f798609825e5684))
* **rewards:** address Partner Reports PR review ([4daa479](https://github.com/3mrhussein/findeg/commit/4daa479047014cd28f8aa4c1aa6b453cfd78286c)), closes [#279](https://github.com/3mrhussein/findeg/issues/279)
* **rewards:** address Partner Reports review ([a7c476b](https://github.com/3mrhussein/findeg/commit/a7c476bb6b9d6c8bc44c1eb43cdfc43748d6b9a9)), closes [#279](https://github.com/3mrhussein/findeg/issues/279)
* **rewards:** record admin on payment audit and test audit rollback ([51b55c4](https://github.com/3mrhussein/findeg/commit/51b55c47809e2fa6478ba08385682a9655f0d004))
* **school:** address lifecycle review and integration setup ([00c5895](https://github.com/3mrhussein/findeg/commit/00c5895a03f4876aa0d61f35ce482625251d2713))
* **school:** address review on variant eligibility queries ([da4b4ae](https://github.com/3mrhussein/findeg/commit/da4b4aece006d1d1ec72a36050ecb3c806d866d5))
* **school:** enforce draft transitions and Exact Item consistency ([9b919b8](https://github.com/3mrhussein/findeg/commit/9b919b800b3b2df4b911af358eddcde7b807f561))
* **school:** localize the empty school state and rename the parent experience copy namespace ([e54d74e](https://github.com/3mrhussein/findeg/commit/e54d74ea2b54d5d1434f24af54b3f7b38b2e0297))
* **school:** paginate the directory, uncache search and localize the profile copy ([a57cb20](https://github.com/3mrhussein/findeg/commit/a57cb20c943d92e12788399cebd81bf874974f32))
* **school:** stop caching the school profile so list status changes show immediately ([9097e92](https://github.com/3mrhussein/findeg/commit/9097e92fe0071970134fc4695c73abf8b32d2264))
* split client-safe catalog schemas from service-bearing barrel ([#127](https://github.com/3mrhussein/findeg/issues/127)) ([#128](https://github.com/3mrhussein/findeg/issues/128)) ([a376973](https://github.com/3mrhussein/findeg/commit/a376973422c802a753873048905d5a037eae0c07))
* stop running CI on PR edits ([322bcff](https://github.com/3mrhussein/findeg/commit/322bcffd2b8c8a33af6e47a1584b4c08f2f15697))
* stop running CI on PR edits ([191d8a2](https://github.com/3mrhussein/findeg/commit/191d8a2133e65b87b88a8ccc0a5b7315f0b98e97))
* stop running CI on PR edits ([0bb849e](https://github.com/3mrhussein/findeg/commit/0bb849eebb567e56e0a9c996cc2dfca8919c44b6))
* **storefront:** address list selection review feedback ([fdc4dc7](https://github.com/3mrhussein/findeg/commit/fdc4dc704f6d3ed7a9f8b48a86f1892614e9eb20))
* **storefront:** await school profile params under Suspense ([5a508b8](https://github.com/3mrhussein/findeg/commit/5a508b819e0f0505d1803527428667a0eaec014e))
* **storefront:** keep checkout summary totals in sync with the pending attempt ([71d2173](https://github.com/3mrhussein/findeg/commit/71d21731aeecf8ed064bf38a268afd27f2823dce))
* **storefront:** normalise stored list selection on load ([4ad3a22](https://github.com/3mrhussein/findeg/commit/4ad3a2222640bdd2194cd7e9b26a25520226aef0))
* **storefront:** reset checkout attempt after any definitive 4xx order error ([69325ce](https://github.com/3mrhussein/findeg/commit/69325ceeb63e43d630a258ceb8df97ae416d7dd5))
* **storefront:** resolve TypeScript type check errors (T128) ([b5780de](https://github.com/3mrhussein/findeg/commit/b5780deeaea2d4f1e5027b51df2f66c92981bf93))
* **storefront:** restore strict customer end-to-end coverage ([685dfe4](https://github.com/3mrhussein/findeg/commit/685dfe413c7d8ddc0ee5463d9a0a9320d3997796))
* **storefront:** retain full order payload with idempotency key across retries ([f6c72ae](https://github.com/3mrhussein/findeg/commit/f6c72ae976d1d7ea82455c7fb91a50a92f7ba86d))
* **storefront:** trust server eligibility for completeness and use canonical term ([da04332](https://github.com/3mrhussein/findeg/commit/da04332895fe29d658a3e3413e3c29852d7b36ff))
* unblock the release PR (schema lint, E2E display race, PR title rule) ([a152dad](https://github.com/3mrhussein/findeg/commit/a152dad39295dfe4b82adf782d5af4ea02a86bb6))
* unblock the release PR (schema lint, E2E display race, PR title rule) ([7888ed7](https://github.com/3mrhussein/findeg/commit/7888ed73f03d02b7e2bda71569fe8b7a08bcdbe4))
* unblock the release PR (schema lint, E2E display race, PR title rule) ([ba68884](https://github.com/3mrhussein/findeg/commit/ba68884856df89fe4c6d0af68db8acc8d4d15090))
* unblock the release PR (schema lint, E2E display race, PR title rule) ([39438a3](https://github.com/3mrhussein/findeg/commit/39438a36c80d3fe292ae697b3e61383c742c47c1))
* update PostCSS configs for Tailwind CSS v4 compatibility (T130) ([f9aa75a](https://github.com/3mrhussein/findeg/commit/f9aa75a07af157c1c3016ac9d36db2b191bf3974))


### Changed

* adjust connection pool settings and enhance notice handling in database configuration ([bf02805](https://github.com/3mrhussein/findeg/commit/bf028053b5aac9f79de84e2325593a3fe1ab2463))
* **backend,dashboard:** implement clean architecture and service extraction ([0f0cfd2](https://github.com/3mrhussein/findeg/commit/0f0cfd2eda29215b9ce79019d448172c4d328e22))
* **backend:** route outbox cross-feature imports through barrels ([45451e1](https://github.com/3mrhussein/findeg/commit/45451e119cae5b2327eecd9ef1ff579b79ba0a91))
* centralize environment variables and ESLint configurations into shared packages and standardize project structure ([7a3a9e4](https://github.com/3mrhussein/findeg/commit/7a3a9e44d2a9cf69ab58206c265ea4b49e13d445))
* **checkout:** address remaining review smells ([9586de2](https://github.com/3mrhussein/findeg/commit/9586de2973af5c4d9577b256125150f3857e37cc))
* **checkout:** drop unrequested 24h idempotency retention ([b58698e](https://github.com/3mrhussein/findeg/commit/b58698e84e53fc5813bd1ee85e15f690003c7cc2))
* **checkout:** make accept failure codes a closed union ([c7bdb6a](https://github.com/3mrhussein/findeg/commit/c7bdb6acfcb37ddd61354cc0a3471dc4607b3650))
* **checkout:** remove unused idempotency tx param and fingerprint barrel export ([37aa250](https://github.com/3mrhussein/findeg/commit/37aa2507d03042ccb5f0fd52821d22a454799427))
* **checkout:** rename createInitial to claimKey ([a3376b8](https://github.com/3mrhussein/findeg/commit/a3376b88235ec06da64ddbbcbea0ef7e93aa1983))
* **checkout:** reuse db CheckoutReceipt instead of redefining it ([ee11b94](https://github.com/3mrhussein/findeg/commit/ee11b94d32a2f75ed8501743b2ffcc7f66f0647a))
* **checkout:** split accept() into prepare, replay, place and recover steps ([2001a51](https://github.com/3mrhussein/findeg/commit/2001a51362eb9f605d2ae5fe33d90074f62d6904))
* **ci:** drop dead config and simplify the workflow wiring ([b555dfa](https://github.com/3mrhussein/findeg/commit/b555dfa1cb1a7f10576cfe6eb171abb598de6df2))
* **ci:** drop the speculative note on the CI OK verdict ([7fcebce](https://github.com/3mrhussein/findeg/commit/7fcebce52dd28a85a8171463b1ec4466124235e0))
* **ci:** run lint, type check and unit tests as one matrix job ([d006f98](https://github.com/3mrhussein/findeg/commit/d006f9833a99add91d0f1a39740978cf76684fc7))
* **config:** layer the lint standard into profiles with a warning ratchet ([3f6318f](https://github.com/3mrhussein/findeg/commit/3f6318f0b1727f9fdc528d389ffb4d4d596bb6c4))
* **config:** layer the lint standard into profiles with a warning ratchet ([6535a86](https://github.com/3mrhussein/findeg/commit/6535a86618ef98562b6dc97fa1a462dfc8bd5628))
* consolidate storefront features into centralized data actions and clean up redundant domain services and repositories ([c1d64a7](https://github.com/3mrhussein/findeg/commit/c1d64a7c9cb5689dd3b4aa380f0ba2e2cb9d2916))
* **dashboard:** share partner role options between panels ([3762c89](https://github.com/3mrhussein/findeg/commit/3762c89d3794c3497a05c310a69700ed1b5c8517))
* **dashboard:** standardize cypress scenario directory and imports ([#356](https://github.com/3mrhussein/findeg/issues/356)) ([9e38703](https://github.com/3mrhussein/findeg/commit/9e38703a6cf4c226aac543831d355cb2acea4e69))
* **db:** accept optional tx in order and inventory queries ([83129f3](https://github.com/3mrhussein/findeg/commit/83129f39e73f90d9e818849ffbab481116087e58))
* **db:** accept optional tx in order and inventory queries ([2e747de](https://github.com/3mrhussein/findeg/commit/2e747de8db256b1c70eb535ce52b63a09e3572a5)), closes [#236](https://github.com/3mrhussein/findeg/issues/236)
* implement comprehensive architectural updates across catalog, identity, and storefront modules with new data query layers and notification system enhancements. ([86af3bb](https://github.com/3mrhussein/findeg/commit/86af3bb111fa9ef937f4eaaad31ec142d606258f))
* **inventory:** avoid the Allocation term for Stock Reservation ([fdce358](https://github.com/3mrhussein/findeg/commit/fdce358fba95f184d50d61a95cc1bc1173b0bd05))
* **inventory:** drop the Allocation term from index and tests ([8ffd241](https://github.com/3mrhussein/findeg/commit/8ffd241027a7ba243c8630400270f647e63fcf7f))
* migrate database dependencies to backend, consolidate build scripts, and clean up dashboard configuration ([d0ced32](https://github.com/3mrhussein/findeg/commit/d0ced32064875f18395c5ec7bf84db95521bd111))
* migrate database schema and seed data management to a centralized root-level directory ([7a181de](https://github.com/3mrhussein/findeg/commit/7a181de365bf86e4122c7489a3d006b5d6e1c3f2))
* migrate remaining Orders package consumers ([6b9c820](https://github.com/3mrhussein/findeg/commit/6b9c8203ed2027e8f2c89e6d2a4368baf96cf812))
* narrow administration backend API to a feature barrel ([3f141cb](https://github.com/3mrhussein/findeg/commit/3f141cbbda3a6935b3137b1c5a33992b37ab5786))
* narrow administration backend API to a feature barrel ([af862b5](https://github.com/3mrhussein/findeg/commit/af862b50f136e101e8f4c6a5bb4649c8aee947b3))
* narrow cart feature's public backend API to a barrel ([#116](https://github.com/3mrhussein/findeg/issues/116)) ([b819b1e](https://github.com/3mrhussein/findeg/commit/b819b1e04a77a2a588fac7f5c09a5fe3b07106a2))
* narrow core feature's public backend API to a barrel ([#121](https://github.com/3mrhussein/findeg/issues/121)) ([aeb9669](https://github.com/3mrhussein/findeg/commit/aeb9669dd09fa0f0acefe7460b6bc811a1848d6b))
* narrow order backend API to a feature barrel ([c6d7730](https://github.com/3mrhussein/findeg/commit/c6d773055c02d86b9068e2c32201c25d6999548e))
* narrow order backend API to a feature barrel ([21b8d88](https://github.com/3mrhussein/findeg/commit/21b8d88a2b7c1c7f24e41f19c4f1d2a370f72369))
* narrow review backend API to a feature barrel ([#117](https://github.com/3mrhussein/findeg/issues/117)) ([55107c3](https://github.com/3mrhussein/findeg/commit/55107c33698b7e3397c3d0bfb66ef2a2bdc750ac))
* narrow school backend API to a feature barrel ([#118](https://github.com/3mrhussein/findeg/issues/118)) ([9600276](https://github.com/3mrhussein/findeg/commit/9600276d5dc18ab5a2a2be80c45085cc288703fb))
* **order:** refuse order writes with core's NotAuthorizedError ([b78ccec](https://github.com/3mrhussein/findeg/commit/b78ccecc332f0a29622113065e1c86fae48c1508))
* **order:** tighten pre-delivery refund tests and status select ([e4ad549](https://github.com/3mrhussein/findeg/commit/e4ad549c0d099fa94d1188b8f203980f275f1ef8)), closes [#301](https://github.com/3mrhussein/findeg/issues/301)
* **partner-membership:** align invitation error types with the public interface ([f2019af](https://github.com/3mrhussein/findeg/commit/f2019af99136eef52837641eeeecbbf2d84e7bfd))
* **partner-membership:** polish invitations UI and docs from review ([bbb8786](https://github.com/3mrhussein/findeg/commit/bbb878680a9c7de8cf9f84a100077dd5b3f7dcb3))
* **partner-membership:** rename activation guard error and type the status action ([cc974bd](https://github.com/3mrhussein/findeg/commit/cc974bd2323d1d16d81038e0ed1b2cd273db189c))
* **partner-membership:** tidy review findings on invitation actions ([f26afdf](https://github.com/3mrhussein/findeg/commit/f26afdfb4ac9ba59187dffba1d92db00b6de90c6))
* perform comprehensive codebase-wide cleanup, type standardization, and infrastructure refactoring across frontend and backend services. ([b06ed90](https://github.com/3mrhussein/findeg/commit/b06ed901cdc8c7972cfe7d27141a6d5c33f069f1))
* perform comprehensive system-wide cleanup, feature consolidation, and repository migration across catalog, identity, and access modules ([005181c](https://github.com/3mrhussein/findeg/commit/005181c34d6e60ae550c295cf47ba288fecc1bb3))
* remove redundant JSDoc comments from Drizzle repositories. ([bba446b](https://github.com/3mrhussein/findeg/commit/bba446b058431f831f37a5c392a0b7786173f127))
* remove unnecessary PostgreSQL configuration options in frontend quality workflow ([f0fb22e](https://github.com/3mrhussein/findeg/commit/f0fb22ea07142bb54b157bb3ed983c31389468ef))
* remove variant-specific pricing and unit of measure (UoM) c… ([b0bbbea](https://github.com/3mrhussein/findeg/commit/b0bbbea6a50d8ec724ac38370cccd7d47d7584e3))
* remove variant-specific pricing and unit of measure (UoM) configurations from database schema and application logic ([e0f8616](https://github.com/3mrhussein/findeg/commit/e0f8616c887f19241b5b13601be458c3e0ba390b))
* reorganize application into a feature-based architecture with bounded contexts. ([e489373](https://github.com/3mrhussein/findeg/commit/e48937323fda62103a5269918972866096c56cea))
* reorganize project structure by moving packages to frontend directory and cleaning up build artifacts ([d62a69c](https://github.com/3mrhussein/findeg/commit/d62a69c1fbdeea88c16f9ad6efd0b9a9c8539f74))
* replace PostgreSQL service configuration with docker-compose setup in frontend quality workflow ([b464ea5](https://github.com/3mrhussein/findeg/commit/b464ea5c76b2ad35ee9b6418717a334756cba4e7))
* replace the Partner Rewards ledger with Attributed Order reads ([3710ccd](https://github.com/3mrhussein/findeg/commit/3710ccd2407f3052fc1a89c2488c7d3703a97cf6))
* replace the Partner Rewards ledger with Attributed Order reads ([15875a7](https://github.com/3mrhussein/findeg/commit/15875a7ac2e1adf62b54aaf36daa6ccd3c35653c)), closes [#298](https://github.com/3mrhussein/findeg/issues/298)
* restructure internationalization messages into domain-specific files and update component usage. ([3cd69f5](https://github.com/3mrhussein/findeg/commit/3cd69f565e6fa3155412c2f00ff192e47363b539))
* retire the school_staff portal role ([6f66c95](https://github.com/3mrhussein/findeg/commit/6f66c95882360ee63487d80269d39226255f8a93))
* retire the school_staff portal role ([887f414](https://github.com/3mrhussein/findeg/commit/887f4140812a6c707fb05bee1e2ee84b75b64ddc)), closes [#177](https://github.com/3mrhussein/findeg/issues/177)
* **rewards:** extract shared statement-and-sales core and itemise debt forgiveness ([7824f90](https://github.com/3mrhussein/findeg/commit/7824f90e4ea10cbf554878a0be3621860a999126)), closes [#278](https://github.com/3mrhussein/findeg/issues/278)
* **rewards:** rename write-off to debt forgiveness ([c1f82d7](https://github.com/3mrhussein/findeg/commit/c1f82d73cdb6d363459a2d45fdcc018b54996228))
* **rewards:** target the adjustment idempotency index explicitly ([f7915b3](https://github.com/3mrhussein/findeg/commit/f7915b3ad0f80d58c34ca1616c5e3b9d2c42de6f)), closes [#276](https://github.com/3mrhussein/findeg/issues/276)
* **school:** read the directory from partner schools and drop legacy list tables ([f33a7c4](https://github.com/3mrhussein/findeg/commit/f33a7c440a672e4907a437150eddb9bce5ea1e7f))
* **school:** read the directory from partner schools and drop legacy list tables ([97a31b2](https://github.com/3mrhussein/findeg/commit/97a31b26251e6b9df1e3b55301f75efb517671ef)), closes [#217](https://github.com/3mrhussein/findeg/issues/217)
* **school:** remove the School List access apparatus ([ebb649d](https://github.com/3mrhussein/findeg/commit/ebb649df61c7205e91b33e38d4496c3a1e45b3c1)), closes [#216](https://github.com/3mrhussein/findeg/issues/216)
* **school:** remove the School List access apparatus and slug route ([7462938](https://github.com/3mrhussein/findeg/commit/7462938abb5ba14c95e17e9d85439205ec67e32f))
* simplify catalog data schema and update associated backend, database, and frontend components ([7c98659](https://github.com/3mrhussein/findeg/commit/7c98659f45a39f5056dd817db6e8706198b7c22d))
* simplify project-wide module resolution by removing workspace path aliases from tsconfig files ([638d133](https://github.com/3mrhussein/findeg/commit/638d133f8ffda5bdd0103395023d078a61ac17a3))
* split catalog service factories ([#144](https://github.com/3mrhussein/findeg/issues/144)) ([f113a4a](https://github.com/3mrhussein/findeg/commit/f113a4a11b4742c93414ee0974c2554e45aceb28))
* **storefront:** self-host Cairo and Inter fonts using next/font/local ([a54a0fa](https://github.com/3mrhussein/findeg/commit/a54a0fa08e543c58ddc7fbf73076932915a5413b))
* **storefront:** self-host fonts and optimize CI workflows ([a675f6d](https://github.com/3mrhussein/findeg/commit/a675f6d3db59e86c4e5e890a053b88d85b0c9e3b))
* **storefront:** share eligible-choice check and hide completeness on archived lists ([df5a9d3](https://github.com/3mrhussein/findeg/commit/df5a9d357784278b6d54714cc75b2d5e059cc9d4))
* **storefront:** type the order response instead of optional-chaining through it ([99f9d50](https://github.com/3mrhussein/findeg/commit/99f9d5061f8c4f7d56ae1f785ab7d5168ada4063))
* Streamline product localization and form mapping by removing dedicated translation tables and introducing a product form mapper. ([d6c6220](https://github.com/3mrhussein/findeg/commit/d6c6220a654d74db3a51f64ea1a1173c8347f6ff))
* streamline TypeScript configurations and improve project structure ([1465a10](https://github.com/3mrhussein/findeg/commit/1465a10b0b1b6e3e4e870fee50bd45be82f94fc7))
* update .env file creation step and replace schema push with database migration ([493f975](https://github.com/3mrhussein/findeg/commit/493f975fba1106cb0fa0689447449e630ca0c2dd))
* update imports to use [@findeg](https://github.com/findeg) namespace for UI and backend features ([2887752](https://github.com/3mrhussein/findeg/commit/288775217adc21be81ecd30a7bd74afff385b382))
* update migration environment setup and streamline database migration process ([1ca27ef](https://github.com/3mrhussein/findeg/commit/1ca27ef0374f382d74971c54ad332ada0cd2f84d))
* update PostgreSQL commands to use 'docker compose' syntax ([7e64bbf](https://github.com/3mrhussein/findeg/commit/7e64bbfe0bdd046ce555dc963bc42ccd680a5666))

## [2026-04-05] Backend Pure TypeScript Refactoring

### Architecture Changes

- **BREAKING**: Refactored `@backend` to be a pure TypeScript library with zero framework dependencies
- Eliminated all 21 Next.js imports from backend package (`next/cache`, `next/navigation`, `next/headers`)
- Removed `next`, `react`, `react-dom`, and `@ui` from backend package.json dependencies
- Backend services now run in pure Node.js environment (Vitest, 188 tests, 13.15 seconds execution)

### New Patterns

- **ServiceResult Pattern**: Backend services return data + cache metadata; app-layer handles cache invalidation
- **Domain Errors**: 7 typed error classes (`NotAuthenticatedError`, `NotAuthorizedError`, `ResourceNotFoundError`, `ValidationError`, `ConflictError`, `BusinessRuleViolationError`, `DomainError` base)
- **Dependency Injection**: `ICookieStore` interface abstracts Next.js `cookies()` API
- **App-Layer Integration**: 54 Server Actions created in dashboard/storefront wrapping backend services

### Features

- Backend can now be imported and tested in any Node.js environment
- All backend tests run in pure Node.js without Next.js runtime
- Framework-agnostic session management via dependency injection
- Centralized error handling and cache invalidation in app-layer helpers

### Modified Files

- **Backend Core**: 7 domain error classes, `ServiceResult<T>` type, `ICookieStore` interface
- **Identity**: `auth.ts`, `profile.ts`, `dashboard.ts`, `my-account.ts` (4 files)
- **Order**: `order.ts` (1 file)
- **Catalog**: `product.ts`, `brand.ts`, `category.ts`, `shop-page.ts`, `storefront.ts`, `category-page.ts` (6 files)
- **Administration**: `admin-tag-actions.ts`, `admin-collection-actions.ts`, `admin-order-actions.ts`, `admin-product-actions.ts`, `inventory.ts` (5 files)
- **Core Session**: `CookieSessionProvider.ts` (1 file)
- **School**: Removed `useSchoolListLookup.ts` presentation hook from backend (moved to storefront)

### App-Layer Files Created

- **Dashboard**: `session.ts`, `cache.ts`, `errors.ts`, `auth-actions.ts`, `profile-actions.ts`, `order-actions.ts`, `catalog-actions.ts`, `admin-actions.ts` (8 files)
- **Storefront**: `session.ts`, `cache.ts`, `errors.ts`, `shop-queries.ts` (4 files)

### Testing

- 188/188 unit tests passing in pure Node.js (Vitest)
- Test execution: 13.15 seconds (56% faster than 30-second target)
- Zero Next.js runtime dependencies in tests
- Comprehensive test coverage: domain errors, service results, auth, profile, order, catalog

### Documentation

- Updated `/packages/backend/README.md` with Pure TypeScript architecture documentation
- Created `/docs/architecture/BACKEND_MIGRATION_PATTERNS.md` migration guide
- Updated Constitution compliance (Principle VIII: Backend Packages - Pure TypeScript Libraries)

### Constitution Compliance

- ✅ Principle I: Clean Architecture maintained (4-layer structure)
- ✅ Principle V: Type-Safe & Testable (strict TypeScript, 188 tests)
- ✅ Principle VI: DRY (centralized cache/error logic)
- ✅ Principle VII: SOLID (Single Responsibility, Dependency Inversion, Interface Segregation)
- ✅ **Principle VIII: Backend Packages - Pure TypeScript Libraries** (PRIMARY GOAL ACHIEVED)

### Migration Impact

- **No Breaking Changes for End Users**: All dashboard and storefront functionality unchanged
- **Breaking for Internal Imports**: Backend services now return `ServiceResult<T>` instead of void
- **Breaking for Tests**: Backend tests now require mock `ICookieStore` instead of Next.js `cookies()`

---

## Previous Updates

Latest commit date: 2026-02-19
Range: HEAD

## Added

- Implement checkout flow, add Cypress E2E tests for shop and admin, and refactor product and header components. (`93e07c2`, 2026-02-19)
- Implement variant pricing, refactor storefront components, and update core features and documentation. (`ae90438`, 2026-02-17)
- Implement comprehensive admin panel features for product, brand, order, and inventory management, and expand API endpoints for cart, checkout, authentication, and logging. (`f22f13a`, 2026-02-15)
- Refactor header into modular components and add product translation fetching for admin editing. (`81fa6f1`, 2026-02-14)

## Changed

- reorganize application into a feature-based architecture with bounded contexts. (`e489373`, 2026-02-15)

## Maintenance

- stop tracking .next directory (`c9d7293`, 2026-01-17)

## Other

- Refactor project structure by migrating presentation layer components to the app router, introducing new common and UI components, and updating application services and infrastructure. (`92df258`, 2026-02-14)
- fix next-intl setup and linting errors (`7b6e9ec`, 2026-01-20)
- i18n (`88f8a28`, 2026-01-19)
- finlizaing the clean archhetcture implementation (`99a30b0`, 2026-01-18)
- refactoring clean archecture (`1d88c81`, 2026-01-18)
- update readme (`67d6059`, 2026-01-18)
- implement clean archetcture (`920de55`, 2026-01-18)
- create a src directory (`8f1fc03`, 2026-01-18)
- refactoring (`4f88303`, 2026-01-17)
- fix project styles (`02656b5`, 2026-01-17)
- first step migration (`87922c1`, 2026-01-17)
- initial commit (`6f831bc`, 2026-01-17)
