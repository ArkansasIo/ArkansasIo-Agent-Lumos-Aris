# Lumos Aris Universal Engineering Registry

The engineering registry is the capability catalog for the Lumos Aris IDE and agent swarm.

## Included catalogs

- Programming languages and file extensions
- Frameworks and libraries
- Developer tools and agent capabilities
- UML and C4 diagrams
- Mermaid and Graphviz targets
- Build systems and package managers
- Test runners
- Database systems
- Documentation formats

The registry is metadata-first. A listed compiler, debugger, LSP or database is not assumed to be installed. Runtime adapters must detect installed capabilities before exposing executable actions.

## Planned adapter contracts

- LanguageServerAdapter
- CompilerAdapter
- FormatterAdapter
- LinterAdapter
- DebuggerAdapter
- PackageManagerAdapter
- TestRunnerAdapter
- DatabaseAdapter
- DocumentationAdapter
- DiagramRendererAdapter

## Engineering traceability

Requirement -> Architecture/UML -> Task -> Code -> Build -> Test -> Review -> Documentation -> Pull Request -> Deployment.
