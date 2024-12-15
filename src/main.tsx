// Learn more at developers.reddit.com/docs
import { Devvit, useState } from '@devvit/public-api';

// Configure Devvit
Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Define words and definitions as an array of objects
const wordDefinitions = [
  { word: "TRUST", definition: "Reliance on the character/ability/strength/truth of someone" },
  { word: "CONTEMPT", definition: "Feeling that someone is beneath consideration" },
  { word: "EXCITEMENT", definition: "Great enthusiasm and eagerness" },
  { word: "CALMNESS", definition: "Being free from agitation or strong emotion" },
  { word: "DETERMINATION", definition: "Firmness of purpose; resoluteness" },
  { word: "JEALOUSY/ENVY", definition: "Pain from others' good fortunes" },
  { word: "SHAME", definition: "Pain from regrettable acts; not confident" },
  { word: "PITY", definition: "Pain caused by others' misfortunes" },
  { word: "ANGER", definition: "Fear/sadness" },
  { word: "SHYNESS", definition: "Nervous/reserved in front of others" },
  { word: "DENIAL", definition: "Ignoring when something is wrong" },
  { word: "DISGUST", definition: "Strong disapproval caused by something unpleasant or offensive" },
  { word: "FEAR", definition: "Often immediate anxiety or tension caused by pain" },
  { word: "GRATITUDE", definition: "Appreciative of benefits received" },
  { word: "COMPASSION", definition: "Feeling caused by observing/hearing others suffering" },
  { word: "WORRY", definition: "Fear caused from preoccupied thoughts" },
  { word: "CONFUSION", definition: "Uncertainty and not understanding" },
  { word: "ACCEPTANCE", definition: "Approval from self or others" },
  { word: "HAPPINESS", definition: "Feeling well-adjusted or of good fortune" },
  { word: "SURPRISE", definition: "When something unexpected occurs" },
  { word: "SHAMELESSNESS", definition: "Lacking pain from regrettable acts" },
  { word: "EMULATION", definition: "Mirroring another's traits" },
  { word: "APATHY", definition: "The opposite of love" },
  { word: "ANTICIPATION", definition: "Expectation" },
  { word: "INDIGNATION", definition: "Anger or annoyance from unfair treatment" }
];

// Shuffle the words and create a Bingo Board
const generateBingoBoard = (): { word: string, definition: string }[][] => {
  const shuffled = wordDefinitions.sort(() => Math.random() - 0.5);
  const board = [];
  for (let i = 0; i < 5; i++) {
    board.push(shuffled.slice(i * 5, i * 5 + 5));
  }
  return board;
};

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'Add Bingo Game Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Creating your Bingo game post!");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'Emotion Bingo Game!',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Gain a sense of what your emotions are really telling you. Match the definition to the emotion it connects to.</text>
          <text size="large">Setting up your Bingo game...</text>
        </vstack>
      ),
    });
    ui.navigateTo(post);
  },
});

// Bingo Game Component
const BingoGame = () => {
  // Keeps track of the tiles on the board
  const [tiles, setTiles] = useState<{ word: string, definition: string }[][]>(generateBingoBoard());
  const [markedTiles, setMarkedTiles] = useState<boolean[][]>(
    Array(5).fill(null).map(() => Array(5).fill(false))
  );

  // Keeps track of what word is active and available words
  const [currentDefinition, setCurrentDefinition] = useState<string>(wordDefinitions[0].definition);
  const [currentWord, setCurrentWord] = useState<string>(wordDefinitions[0].word);
  const [availableDefinitions, setAvailableDefinitions] = useState<string[]>(wordDefinitions.map(def => def.definition));
  const [winner, setWinner] = useState<boolean>(false);

  // Checks to see if correct word was chosen
  const handleTileClick = (row: number, col: number) => {
    const clickedWord = tiles[row][col].word;

    // Only mark the tile if it matches the current word
    if (clickedWord === currentWord) {
      // Mark the tile as clicked
      setMarkedTiles((prev) => {
        const updated = prev.map((r, i) =>
          r.map((tile, j) => (i === row && j === col ? true : tile))
        );
        checkWinCondition(updated);
        return updated;
      });

      // Remove the definition from available ones
      setAvailableDefinitions((prev) => prev.filter(def => def !== tiles[row][col].definition));

      // Move to the next definition randomly
      if (availableDefinitions.length > 0) {
        // Select a new definition and its corresponding word
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * availableDefinitions.length);
        } while (availableDefinitions[randomIndex] === currentDefinition);

        const nextDefinition = availableDefinitions[randomIndex];
        const nextWord = wordDefinitions.find(def => def.definition === nextDefinition)?.word || "";

        setCurrentDefinition(nextDefinition);
        setCurrentWord(nextWord);
      }
    }
  };

  // Checks to see if five in a row was created (if player wins)
  const checkWinCondition = (markedTiles: boolean[][]) => {
    // Check rows
    for (const row of markedTiles) {
      if (row.every((tile) => tile)) {
        setWinner(true);
        return;
      }
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      if (markedTiles.every((row) => row[col])) {
        setWinner(true);
        return;
      }
    }

    // Check both diagonals
    if (markedTiles.every((_, i) => markedTiles[i][i])) {
      setWinner(true);
      return;
    }
    if (markedTiles.every((_, i) => markedTiles[i][4 - i])) {
      setWinner(true);
      return;
    }
  };

  return (
    <vstack height="100%" width="100%" alignment="center middle" gap="medium">
      <text size="large" weight="bold">Bingo Game</text>
      {winner ? (
        <text size="large" weight="bold">You Win! 🎉</text>
      ) : (
        <text size="medium" weight="regular">{currentDefinition}</text>
      )}

      <vstack width="auto" alignment="center middle" gap="small">
        {tiles.map((row, rowIndex) => (
          <hstack key={`row-${rowIndex}`} gap="small" justify="center">
            {row.map((tile, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                appearance={markedTiles[rowIndex][colIndex] ? "primary" : "default"}
                onPress={() => handleTileClick(rowIndex, colIndex)}
                style={{
                  width: "100px",
                  height: "60px",
                  textAlign: "center",
                  fontSize: "small",
                }}
                disabled={winner} // Disable buttons if there's a winner
              >
                {tile.word}
              </button>
            ))}
          </hstack>
        ))}
      </vstack>

    </vstack>
  );
};

// Add a custom post type for the Bingo Game
Devvit.addCustomPostType({
  name: 'Emotion Bingo Game',
  height: 'regular',
  render: (_context) => {
    return <BingoGame />;
  },
});

export default Devvit;