{
  "compilerOptions": {
    "target": "ES2020",                          // Specify ECMAScript target version
    "module": "ESNext",                          // Specify module code generation
    "lib": ["DOM", "DOM.Iterable", "ES2020"],    // Specify library files to be included
    "allowJs": true,                             // Allow JavaScript files to be compiled
    "checkJs": false,                            // Report errors in .js files
    "jsx": "react-jsx",                          // Specify JSX code generation
    "declaration": true,                         // Generates corresponding '.d.ts' file
    "declarationMap": true,                      // Generates a sourcemap for each corresponding '.d.ts' file
    "sourceMap": true,                           // Generates corresponding '.map' file
    "outDir": "./dist",                          // Redirect output structure to the directory
    "rootDir": "./src",                          // Specify the root directory of input files
    "strict": true,                              // Enable all strict type-checking options
    "noImplicitAny": true,                       // Raise error on expressions and declarations with an implied 'any' type
    "strictNullChecks": true,                    // Enable strict null checks
    "strictFunctionTypes": true,                 // Enable strict checking of function types
    "strictBindCallApply": true,                 // Enable strict 'bind', 'call', and 'apply' methods on functions
    "strictPropertyInitialization": true,        // Enable strict checking of property initialization in classes
    "noImplicitThis": true,                      // Raise error on 'this' expressions with an implied 'any' type
    "alwaysStrict": true,                        // Parse in strict mode and emit "use strict" for each source file
    "noUnusedLocals": true,                      // Report errors on unused locals
    "noUnusedParameters": true,                  // Report errors on unused parameters
    "noImplicitReturns": true,                   // Report error when not all code paths in function return a value
    "noFallthroughCasesInSwitch": true,          // Report errors for fallthrough cases in switch statement
    "moduleResolution": "node",                  // Specify module resolution strategy
    "baseUrl": "./",                             // Base directory to resolve non-relative module names
    "paths": {                                   // A series of entries which re-map imports to lookup locations relative to the 'baseUrl'
      "@src/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    },
    "typeRoots": ["./node_modules/@types"],      // List of folders to include type definitions from
    "esModuleInterop": true,                     // Enables emit interoperability between CommonJS and ES Modules
    "skipLibCheck": true,                        // Skip type checking of declaration files
    "forceConsistentCasingInFileNames": true,    // Disallow inconsistently-cased references to the same file
    "incremental": true,                         // Enable incremental compilation
    "composite": true,                           // Enable project compilation
    "emitDecoratorMetadata": true,               // Emit design-type metadata for decorated declarations
    "experimentalDecorators": true,              // Enables experimental support for decorators
    "isolatedModules": true,                     // Ensure that each file can be safely transpiled without relying on other imports
    "resolveJsonModule": true,                   // Include modules imported with .json extension
    "allowSyntheticDefaultImports": true,        // Allow default imports from modules with no default export
    "downlevelIteration": true,                  // Provide full support for iterables in ES5/ES3
    "removeComments": true,                      // Remove all comments except copy-right header comments
    "preserveConstEnums": true,                  // Do not erase const enum declarations in generated code
    "noEmitOnError": true,                       // Do not emit outputs if any errors were reported
    "importHelpers": true,                       // Import emit helpers from tslib
    "useDefineForClassFields": true              // Emit ECMAScript-standard-compliant class fields
  },
  "include": ["src"],                            // List of files to be included in the compilation
  "exclude": ["node_modules", "dist", "build"],  // List of files to be excluded from the compilation
  "references": [                                // List of project references
    { "path": "./tsconfig.base.json" }
  ]
}