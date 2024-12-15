// Learn more at developers.reddit.com/docs
import { Devvit, useState } from '@devvit/public-api';
// import BingoGame from '../bingoGame/bingo.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'Add to my hackathon post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'My Reddit Hackathon post',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.navigateTo(post);
  },
});

const CounterGame = () => {
    const [counter, setCounter] = useState(0);

    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle">
        <image
          url="logo.png"
          description="logo"
          imageHeight={256}
          imageWidth={256}
          height="48px"
          width="48px"
        />
        <text size="large">{`Click counter: ${counter}`}</text>
        <button appearance="primary" onPress={() => setCounter((counter) => counter + 1)}>
          Click me!
        </button>
      </vstack>
    );
};

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'regular',
  render: (_context) => {
    return <CounterGame />
  },
});

export default Devvit;
