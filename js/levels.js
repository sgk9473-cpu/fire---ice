export const LEVELS = {
  level1: {
    name: "Level 1 - 箱子与传送",
    map: [
      "################",
      "#F..a...B.f.X..#",
      "################",
      "#I..A..T#####.Y#",
      "########Ti.b...#",
      "################"
    ],
    doors: [
      { id: "A", char: "A" },
      { id: "B", char: "B" }
    ],
    switches: [
      { id: "a", char: "a", controls: ["A"] },
      { id: "b", char: "b", controls: ["B"] }
    ],
    expectedSolutionActions: [
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_UP",
      "ICE_RIGHT"
    ]
  },

  level2: {
    name: "Level 2 - 传送协同",
    map: [
      "######################",
      "#F..a.B...T..f.X.....#",
      "#.##.####.###.####...#",
      "#.##....K...#.O..#...#",
      "#.fLL..####.#.##.#...#",
      "#....#......#..#.#...#",
      "#I...AWWW.T..iYKb....#",
      "######################"
    ],
    doors: [
      { id: "A", char: "A" },
      { id: "B", char: "B" }
    ],
    switches: [
      { id: "a", char: "a", controls: ["A"] },
      { id: "b", char: "b", controls: ["B"] }
    ],
    expectedSolutionActions: [
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "FIRE_DOWN",
      "FIRE_DOWN",
      "FIRE_DOWN",
      "FIRE_LEFT",
      "FIRE_LEFT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_DOWN",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_DOWN",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_UP",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_DOWN",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT"
    ]
  },

  level3: {
    name: "Level 3 - 传送协同进阶",
    map: [
      "########################",
      "#F..a.B...T..f.X.......#",
      "#.##.####.###.####.#...#",
      "#.##....K...#.O....#...#",
      "#iLL..####..#.##.###...#",
      "#....#......#..#.......#",
      "#I...AWWWW.T..iYKb.....#",
      "########################"
    ],
    doors: [
      { id: "A", char: "A" },
      { id: "B", char: "B" }
    ],
    switches: [
      { id: "a", char: "a", controls: ["A"] },
      { id: "b", char: "b", controls: ["B"] }
    ],
    expectedSolutionActions: [
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_UP",
      "ICE_UP",
      "ICE_DOWN",
      "ICE_DOWN",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_LEFT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_UP",
      "FIRE_DOWN",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_LEFT"
    ]
  }
};
