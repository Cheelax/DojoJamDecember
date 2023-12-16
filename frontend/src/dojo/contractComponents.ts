/* Autogenerated file. Do not edit manually. */

import { defineComponent, Type as RecsType, World } from "@dojoengine/recs";

export function defineContractComponents(world: World) {
  return {
	  Player: (() => {
	    return defineComponent(
	      world,
	      { id: RecsType.BigInt, x: RecsType.Number, y: RecsType.Number, orientation: RecsType.Number },
	      {
	        metadata: {
	          name: "Player",
	          types: ["contractaddress","u16","u16","u8"],
	          customTypes: [],
	        },
	      }
	    );
	  })(),
  };
}
