import { Container, Sprite, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import { useEffect, useState } from "react";
import { defineSystem, Has } from '@dojoengine/recs';
import whiteHerbSprite from '../assets/tilesets/herb1.png';
import redPotionSprite from '../assets/red_potion.png';
import { sound as pixiSound } from '@pixi/sound';

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
            if (localPlayer && newValue && newValue.id == localPlayer.id) {
                setInventory((inventory: any) => {
                    // Pick herb
                    if (inventory && inventory.nb_white_herbs < newValue.nb_white_herbs) {
                        pixiSound.play('pick_flower')
                    }
                    // Drink potion
                    if (inventory && inventory.nb_red_potions > newValue.nb_red_potions) {
                        pixiSound.play('health_restore')
                    }
                    // Craft potion
                    if (inventory && inventory.nb_red_potions < newValue.nb_red_potions) {
                        pixiSound.play('drink')
                    }
                    return newValue
                });
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
              x={40} y={600 - 50}
            >
                <Text text={`${inventory.nb_white_herbs}`} x={15} y={-5} style={
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
              x={40 + 100} y={600 - 50}
              onpointerdown={() => {
                drink_potion(account)
              }}
              >
              <Text text={`${inventory.nb_red_potions}`} x={15} y={-5} style={
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
