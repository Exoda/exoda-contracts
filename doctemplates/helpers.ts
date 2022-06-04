/* eslint-disable node/no-unpublished-import */
import { ASTDereferencer, findAll } from "solidity-ast/utils";
import { DocItemWithContext, DOC_ITEM_CONTEXT } from "solidity-docgen/dist/site";

export function allEvents(this: DocItemWithContext)
{
	if (this.nodeType === "ContractDefinition")
	{
		const deref: ASTDereferencer = this[DOC_ITEM_CONTEXT].build.deref;
		const parents = this.linearizedBaseContracts.map(deref("ContractDefinition"));

		const r = parents.flatMap(p => [...findAll("EventDefinition", p)]);
		// console.log(`Events: ${this.canonicalName} -> ${r.map(e => e.name)}`);
		return r;
	}
}
