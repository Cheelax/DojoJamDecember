import { Container, Sprite, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import { useEffect, useState } from "react";
import { defineSystem, Has } from '@dojoengine/recs';
import whiteHerbSprite from '../assets/tilesets/herb1.png';
import redPotionSprite from '../assets/red_potion.png';

interface InventoryProps {
    networkLayer: any;
    localPlayer: any;
}

const Inventory: React.FC<InventoryProps> = ({ networkLayer, localPlayer }) => {
    if (networkLayer == null) return null;
    const {
        world,
        account,
        systemCalls: { drink_potion },
        components: { PlayerInventory },
    } = networkLayer;
    const [inventory, setInventory] = useState<any>();

    // Retrieve inventory
    useEffect(() => {
        defineSystem(world, [Has(PlayerInventory)], function ({ value: [newValue] }: any) {
            if (newValue && newValue.id == localPlayer.id) {
                setInventory(newValue);
            }
        });
    }, []);

    if (inventory === undefined) return;

    return (
        <Container>
            <Sprite
              image={whiteHerbSprite}
              scale={2}
              anchor={0.5}
              x={25} y={600 - 30}
            >
                <Text text={`${inventory.nb_white_herbs}`} x={15} y={-10} style={
                    new TextStyle({
                        align: 'left',
                        fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
                        fontSize: 15,
                        fontWeight: '400',
                        fill: 'fff',
                    })
                }/>
            </Sprite>

            <Sprite
              image={redPotionSprite}
              scale={2}
              anchor={0.5}
              eventMode={"static"}
              x={25 + 100} y={600 - 30}
              onpointerdown={() => {
                drink_potion(account)
              }}
              >
              <Text text={`${inventory.nb_red_potions}`} x={15} y={-10} style={
                  new TextStyle({
                      align: 'left',
                      fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
                      fontSize: 15,
                      fontWeight: '400',
                      fill: 'fff',
                  })
              }/>
          </Sprite>
        </Container>
    )
};

export default Inventory;
