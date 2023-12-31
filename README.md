![Logo_v4_fill](https://github.com/Cheelax/DojoJamDecember/assets/92889945/628eb98f-529c-47bc-8df5-95e428bfc187)


***Plague Survivor***

**Overview**

"Plague Survivor" is a play2Die strategic game where players are thrust into a perilous world overrun by a deadly plague.
In this game, your objective is to explore the map, outlast others, and cleverly infect other players to earn in-game rewards. The dynamics of survival and infection intertwine as you navigate through this treacherous world.

**Currency and Rewards**

In "Plague Survivor," the primary currency is $LORDS. Players can earn 10 $LORDS by infecting others who subsequently die from the plague.
Conversely, if a player succumbs to infection while exploring, their resurrection fee of 10 $LORDS is contributed to the game's treasury. 
This treasury is then distributed weekly among the top 10 players on the leaderboard, creating a competitive atmosphere for players to strive for top rankings.


![2](https://github.com/Cheelax/DojoJamDecember/assets/92889945/e8bd0d20-96a4-497f-9445-f3f5684ec5b7)


**Starting the Game**

At the beginning of the game, players are faced with the critical decision of resurrecting a deceased survivor by paying 10 $LORDS. 
The choice of survivor is significant as it grants the player a unique perk based on the chosen survivor's strongest stat. 
For instance, selecting a survivor with high vitality increases the maximum infection stacks to five instead of three. A survivor with exceptional dexterity decreases the chance of getting infected to just 5% while exploring the map. Choosing a survivor with great strength means that after infection, players can survive for 90 seconds instead of the usual 60.


![3](https://github.com/Cheelax/DojoJamDecember/assets/92889945/f510113d-965c-4891-9001-4db2dc4ea315)


**Gameplay Mechanics**

As players embark on their journey, they will move across the game map one tile at a time, earning one point for each tile explored. 
The map is filled with various activities and items, predominantly herbs, which can be collected and converted into potions at alchemy labs.
These potions are crucial for survival as they provide the means to cure the plague. 
Players must also navigate encounters with other infected players, making strategic decisions to either avoid or infect them to gain advantages.


![1](https://github.com/Cheelax/DojoJamDecember/assets/92889945/c5565aee-34d0-4070-907d-4d8a1653675d)


**Strategy and Survival**

The essence of "Plague Survivor" lies in its strategic gameplay. Players must carefully manage their resources, like herbs and potions, to ensure their survival. 
The game demands a balance between exploration, resource management, and strategic interactions with other players. 
Each player's approach to survival can significantly influence their chances of climbing the leaderboard and earning rewards.

**Conclusion**

"Plague Survivor" aims to offer an immersive experience where survival tactics, strategic planning, and player interactions converge. The game's success hinges on how well it balances these elements, ensuring fairness and competitiveness.
The ultimate goal for players is to master the delicate balance between surviving the plague and using it to their advantage, all while striving to dominate the leaderboard in this plague-infested world.

*Additional Notes*

This game was created for the Dojo Christmas Game Jam 2023, built on the Realms Autonomous World, using Loot Survivor's Dead Survivors, implementing the $LORDS token (native currency of the Realms AW) and the Pragma VRF to request secure randomness on-chain


![image](https://github.com/Cheelax/DojoJamDecember/assets/92889945/2f5f570b-0796-428a-8384-6ccbd0570b38)

--------------------------------------------

***How to launch the game***

After cloning the project:

1. **Terminal 1 - Katana:**

``` cd client && katana --disable-fee --invoke-max-steps 1000000000```

2. **Terminal 2 - Contract build:**

``` cd client && sozo build && sozo migrate && torii --world  0x691f741c8fd33d557daced16f586c44f3f64633f4a227485b8cd0a8718d9bd4 ```

3. **Terminal 3 - Burner accounts:**

``` bash ./contracts/scripts/default_auth.sh ```
or (depends on OS)
``` sh ./contracts/scripts/default_auth.sh ```

4. **Terminal 4 - Client Front end:**

``` cd client && bun i && bun dev ```
