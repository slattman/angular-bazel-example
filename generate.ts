import * as fs from 'fs';
import * as path from 'path';
import * as mkdir from 'mkdirp';

const utf8 = {encoding: 'utf8'};
const divisionNames = [
    'airplane',
    'biofuels',
    'catapult',
    'deforest',
    'emulator',
    'flooring',
    'graphite',
    'humanoid',
    'internal',
    'joystick',
];

function doGenerate(rootDir: string) {
  // Number of divisions in the company; each division has an app
  const divNum = 10;
  // Number of teams working in each app
  const teamNum = 10;
  // Number of modules in each team's part of the app
  const modNum = 10;
  // Number of components in each module
  const cmpNum = 10;
  let currentComponent = 0;

  for (let divCnt = 0; divCnt < divNum; divCnt++) {
    const divName = divisionNames[divCnt]; //`div${divCnt}`;
    const divDeps = [];
    const divModuleImports = [];
    const divModuleNames = [];

    for (let teamCnt = 0; teamCnt < teamNum; teamCnt++) {
      const teamName = `team${teamCnt}`;
      let appImports = '';
      const teamDeps = [];
      const teamModuleImports = [];
      const teamModuleNames = [];

      for (let modCnt = 0; modCnt < modNum; modCnt++) {
        const modName = `mod${modCnt}`;
        const moduleImports = [];
        const moduleNames = [];

        for (let cmpCnt = 0; cmpCnt < 10; cmpCnt++) {
          const cmpName = `cmp${cmpCnt}`;
          const componentClassName = `Cmp${currentComponent}Component`;
          moduleImports.push(`import {${componentClassName}} from './${cmpName}/cmp';`);
          moduleNames.push(componentClassName);
          const tsContent = `
import {Component} from '@angular/core';
@Component({
    template: '<strong>${currentComponent}</strong>',
})
export class ${componentClassName} {
  add${currentComponent}(x: number) {
    return x + ${currentComponent};
  }
}`;

          const specContent = `
import { ${componentClassName} } from './cmp';
describe('${componentClassName}', () => {
  it('should add', () => {
    expect(new ${componentClassName}().add${currentComponent}(1)).toBe(${1 + currentComponent});
  });
});`;
          // Each component goes in a directory by itself, matching ng-cli
          const dir = path.join(rootDir, divName, teamName, modName, cmpName);
          mkdir.sync(dir);
          fs.writeFileSync(`${dir}/cmp.ts`, tsContent, utf8);
          fs.writeFileSync(`${dir}/cmp.spec.ts`, specContent, utf8);
          currentComponent++;
        } // for each component

        const buildContent = `package(default_visibility = ["//visibility:public"])
load("@angular//:index.bzl", "ng_module")

ng_module(
  name = "${modName}",
  srcs = glob(["**/*.ts"], exclude=["**/*.spec.ts"]),
  tsconfig = "//:tsconfig.json",
)

ng_module(
  name = "${modName}_tests",
  testonly = 1,
  deps = [":${modName}"],
  srcs = glob(["**/*.spec.ts"]),
  tsconfig = "//:tsconfig.json",
)
`;
        const moduleClassName = `Module_${divName}_${teamName}_${modName}`;
        teamModuleImports.push(`import {${moduleClassName}} from './${modName}/module';`);
        teamModuleNames.push(moduleClassName);
        const moduleContent = `
import {NgModule} from '@angular/core';
${moduleImports.join('\n')}
@NgModule({declarations: [${moduleNames.join(',')}]})
export class ${moduleClassName} {}

        `;
        const dir = path.join(rootDir, divName, teamName, modName);
        teamDeps.push(`//${dir}:${modName}`);
        fs.writeFileSync(`${dir}/BUILD.bazel`, buildContent, utf8);
        fs.writeFileSync(`${dir}/module.ts`, moduleContent, utf8);

      } // for each module
      const teamModuleClassName = `Module_${divName}_${teamName}`;
      fs.writeFileSync(path.join(rootDir, divName, teamName, "module.ts"), `
import {NgModule} from '@angular/core';
${teamModuleImports.join('\n')}
@NgModule({
    imports: [${teamModuleNames.join(',')}],
})
export class ${teamModuleClassName}
{}
`, utf8);


      divModuleNames.push(teamModuleClassName);
      divModuleImports.push(`import {${teamModuleClassName}} from './${teamName}/module';`);
      divDeps.push(`//${divName}/${teamName}`);

      fs.writeFileSync(path.join(rootDir, divName, teamName, "BUILD.bazel"), `package(default_visibility = ["//visibility:public"])
#load("@karma//:index.bzl", "karma_test")
load("@angular//:index.bzl", "ng_module")

ng_module(
    name = "${teamName}",
    srcs = ["module.ts"],
    deps = [${teamDeps.map(d => `"${d}"`).join(',')}],
    tsconfig = "//:tsconfig.json",
)
#karma_test(
#    name = "unit_tests",
#    deps = [${teamDeps.map(d => `"${d}"`).join(",\n#        ")},
#        # FIXME(alexeagle): doesn't belong here
#        "@karma//internal/karma_concat_js",
#    ],
#    tags = ["local"]
#)
      `, utf8);

    } // for each team

    const appContent = `
import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
${divModuleImports.join('\n')}

@Component({
  selector: '${divName}-app',
  template: \`<h1>${divName} division homepage</h1>\`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
    imports: [
      BrowserModule,
      ${divModuleNames.join(',\n      ')}
    ],
})
export class AppModule {}
`;
    const mainContent = `
import {platformBrowser} from '@angular/platform-browser';
import {AppModuleNgFactory} from './app.ngfactory';

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
`;
    let buildContent = `
load("@angular//:index.bzl", "ng_module")
ng_module(
    name = "${divName}",
    srcs = ["app.ts", "main.ts"],
    deps = [
        "//shared:logo",
        ${divDeps.map(d => `"${d}"`).join(',\n        ')}
    ],
    tsconfig = "//:tsconfig.json",
)
`;
    if (divName === 'airplane') buildContent += `
load("@build_bazel_rules_nodejs//internal:devmode_js_sources.bzl", "devmode_js_sources")
devmode_js_sources(
    name = "devsources",
    deps = [":${divName}"],
)

load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary")

nodejs_binary(
    name = "devserver",
    entry_point = "com_bigcorp/${divName}/devserver.js",
    data = [
        ":index.html",
        ":devsources",
        # Seems like this should be included in the files[] in the :devsources
        ":devsources.MF",
        ":devserver.js",
        ":patch-rxjs-amd.js",
    ],
    # Tell ibazel not to re-start the server under 'ibazel run'
    # It should just re-build the data[]
    tags = ["IBAZEL_MAGIC_TAG"],
)
`;
    fs.writeFileSync(path.join(rootDir, divName, "app.ts"), appContent, utf8);
    fs.writeFileSync(path.join(rootDir, divName, "main.ts"), mainContent, utf8);
    fs.writeFileSync(path.join(rootDir, divName, "BUILD.bazel"), buildContent, utf8);
  } // for each division
}

function main(argv: string[]): number {
  doGenerate('.');
  return 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
