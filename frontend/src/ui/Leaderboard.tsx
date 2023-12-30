import { Container, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { useEffect, useState } from 'react';
import { defineEnterSystem, defineSystem, Has } from '@dojoengine/recs';

interface LeaderboardProps {
  networkLayer: any;
  localPlayer: any;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ networkLayer, localPlayer }) => {
  if (networkLayer == null) return null;
  const {
    world,
    components: { PlayerScore },
  } = networkLayer;
  const [playersScores, setPlayersScores] = useState<any>({});
  const [list, setList] = useState<any>();

  // Compute players scores
  useEffect(() => {
    if (playersScores === undefined) return;
    // Sort players scores
    const newList = Object.values(playersScores);
    newList.sort((a: any, b: any) => b.nb_tiles_explored - a.nb_tiles_explored);
    setList(newList.slice(0, 5));
  }, [playersScores]);

  // Retrieve players scores
  useEffect(() => {
    defineEnterSystem(world, [Has(PlayerScore)], function ({ value: [newValue] }: any) {
      setPlayersScores((prevPlayers: any) => {
        return { ...prevPlayers, [newValue.id]: newValue };
      });
    });
    defineSystem(world, [Has(PlayerScore)], function ({ value: [newValue] }: any) {
      setPlayersScores((prevPlayers: any) => {
        return { ...prevPlayers, [newValue.id]: newValue };
      });
    });
  }, []);

  function feltToStr(felt: any) {
    let hexString = felt.toString(16);
    if (hexString.length % 2) hexString = '0' + hexString; // Ensure even length
    const byteArray = new Uint8Array(hexString.match(/.{1,2}/g).map((byte:any) => parseInt(byte, 16)));
    return new TextDecoder().decode(byteArray);
  }

  if (list === undefined || localPlayer === undefined) return;

  return (
    <Container>
      <Text
        text={'Highscores'}
        x={20}
        y={20}
        style={
          new TextStyle({
            align: 'center',
            fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
            fontSize: 30,
            fontWeight: '400',
            fill: 'fff',
          })
        }
      />
      {list.map((elem: any, key: number) => {
        return (
          <Container key={`${elem.id.toString()}-container`}>
            <Text
              key={elem.id.toString() + 'name'}
              text={localPlayer.id === elem.id ? 'you' : feltToStr(elem.name) }
              x={20}
              y={45 + (key + 1) * 20}
              style={
                new TextStyle({
                  align: 'center',
                  fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
                  fontSize: 20,
                  fontWeight: '400',
                  fill: 'fff',
                })
              }
            />
            <Text
              key={elem.id.toString() + 'score'}
              text={elem.nb_tiles_explored}
              x={200 - elem.nb_tiles_explored.toString().length * 11}
              y={45 + (key + 1) * 20}
              style={
                new TextStyle({
                  align: 'right',
                  fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
                  fontSize: 20,
                  fontWeight: '400',
                  fill: 'fff',
                })
              }
            />
          </Container>
        );
      })}
    </Container>
  );
};

export default Leaderboard;
