import { Container, Sprite, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import { useEffect, useState } from "react";
import { defineSystem, Has } from '@dojoengine/recs';
import coinSprite from '../assets/lords.png';

interface CoinsProps {
    networkLayer: any;
    localPlayer: any;
}

const Coins: React.FC<CoinsProps> = ({ networkLayer, localPlayer }) => {
    if (networkLayer == null) return null;
    const {
        world,
        components: { ERC20Balance },
    } = networkLayer;
    const [coins, setCoins] = useState<any>();

    // Retrieve coins
    useEffect(() => {
        defineSystem(world, [Has(ERC20Balance)], function ({ value: [newValue] }: any) {
            console.log(newValue)
            if (newValue && newValue.account === parseInt(localPlayer.id)) {
                setCoins(newValue.amount);
            }
        });
    }, []);

    if (!coins) return;

    return (
        <Container>
            <Sprite
              image={coinSprite}
              scale={0.7}
              anchor={0.5}
              x={1280 - 110} y={30}
            >
                <Text text={`${coins.balance}`} x={-100} y={-20} style={
                    new TextStyle({
                        align: 'right',
                        fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
                        fontSize: 32,
                        fontWeight: '400',
                        fill: 'fff',
                    })
                }/>
            </Sprite>
        </Container>
    )
};

export default Coins;
