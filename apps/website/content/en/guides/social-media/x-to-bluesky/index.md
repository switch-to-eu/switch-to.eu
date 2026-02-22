---
title: 'Migrating from X (Twitter) to Bluesky'
description: 'Step-by-step guide for switching from X (Twitter) to Bluesky'
difficulty: 'beginner'
timeRequired: '45 minutes'
sourceService: 'X (Twitter)'
targetService: 'Bluesky'
date: '2025-04-15'
author: 'Switch-to.EU Team'
missingFeatures:
  - 'Direct messages: Bluesky does not currently support private messaging'
  - 'Polls: Creating polls is not yet available on Bluesky'
  - 'Advanced search: Bluesky search is more limited compared to X'
---

<!-- section:intro -->

## Why Switch to Bluesky?

If you're considering an alternative to X (formerly Twitter), Bluesky offers compelling reasons to make the switch:

- **Decentralized platform**: Bluesky is built on the AT Protocol, allowing for greater user control and potential platform interoperability
- **Chronological timeline**: See posts in order without algorithmic interference
- **Custom feeds**: Create or follow curated feeds based on specific interests
- **No advertising**: Currently ad-free experience without targeted data collection
- **Growing community**: Rapidly expanding user base with many communities forming
- **Open-source**: The code is transparent and open for inspection

<!-- end-section -->

<!-- section:before -->

## What You Need

- A valid email address
- A smartphone or computer with internet access
- About 45 minutes of your time (if you want to trasfer your tweets and followers)
- Patience during the transition period

<!-- end-section -->

<!-- section:steps -->

<!-- step-start -->
<!-- step-meta
title: "Sign Up for Bluesky"
complete: true
-->

1. Go to [bsky.app](https://bsky.app)

2. Click "Create a new account" or "Sign up"

3. Enter your email address and create a password

4. Choose a username (this becomes your handle, like @username.bsky.social)
   - Choose something recognizable to help X followers find you
   - Usernames must be lowercase and can include letters, numbers, and underscores

5. Verify your email by clicking the link sent to your email address

6. Complete the account creation process

> **Note**: Bluesky occasionally uses a waitlist during periods of high growth. If registration is closed, you may need to request an invite or get one from an existing user.

<!-- step-end -->

<!-- step-start -->
<!-- step-meta
title: "Set Up Your Profile"
complete: true
-->

Create a profile that helps former X followers recognize you:

1. Tap on your profile icon and select "Edit Profile"
2. Upload a profile picture (preferably the same one you use on X)
3. Add a banner image (optional)
4. Enter your display name (can include spaces and special characters)
5. Write a short bio that represents you
   - Consider mentioning your former X handle
   - Include interests and topics you post about
6. Add a website link (such as your personal site or other social profiles)
7. Save your changes

<!-- step-end -->

<!-- step-start -->
<!-- step-meta
title: "Find and Follow People with Sky Follower Bridge"
complete: true
-->

Easily find your X contacts who are already on Bluesky:

1. Install the [Sky Follower Bridge](https://github.com/jcsalterego/sky-follower-bridge) browser extension for Chrome or Firefox

2. Generate an app password in Bluesky:
   - Go to your Bluesky settings
   - Navigate to "App Passwords"
   - Click "Create app password"
   - Name it "Sky Follower Bridge" and save

3. Visit your X following page:
   - Go to twitter.com/yourusername/following
   - Make sure you're logged into your X account

4. Run the extension:
   - Press Alt+B on Windows or Option+B on Mac
   - A panel will appear on the right side of your screen

5. Authenticate with Bluesky:
   - Enter your Bluesky handle (including .bsky.social)
   - Enter the app password you created (not your regular password)
   - Click "Sign In"

6. Follow discovered users:
   - The extension will scan your X following list
   - It will show which users are also on Bluesky
   - Click "Follow" next to individual users or "Follow All" to follow everyone at once

7. Repeat the process with your X followers:
   - Go to twitter.com/yourusername/followers
   - Run the extension again to find followers who are on Bluesky

> **Tip**: You can also use Sky Follower Bridge to transfer your block list. Visit your blocked accounts page on X and run the extension to block the same accounts on Bluesky.

<!-- step-end -->


<!-- step-start -->
<!-- step-meta
title: "Import Your Tweets (Optional)"
-->

Transfer your tweets to Bluesky using the Porto Chrome Extension:

1. Download your Twitter archive:
   - Go to X Settings > Your Account > Download an archive of your data
   - Confirm your identity and wait for the download link (can take 24-48 hours)

2. Install the [Porto Chrome Extension](https://chromewebstore.google.com/detail/porto/pogniaanbiifpcibfccpjpiibbcnbolc) on Chrome or any Chromium-based browser

3. Extract your Twitter archive ZIP file after downloading

4. Open the Porto extension in your browser:
   - Click on the extension icon in your browser toolbar
   - Select "Import from Twitter archive"

5. Upload your Twitter archive:
   - Click "Select folder" and navigate to your extracted Twitter archive
   - The extension will scan your archive and show importable tweets

6. Configure import settings:
   - Choose which tweets to import (you can filter by date, likes, etc.)
   - Select whether to include images
   - Choose to maintain original posting dates or post as new

7. Authenticate with Bluesky:
   - Generate an app password in Bluesky settings (similar to Sky Follower Bridge)
   - Enter your Bluesky credentials when prompted

8. Start the import process and wait for completion

9. Review imported posts and make any necessary edits

> **Alternative Option**: If you prefer a simpler but paid solution, [BlueArk](https://blueark.app) offers an easy-to-use web interface for importing your Twitter archive to Bluesky. This service requires payment but provides a more streamlined experience.

> **Note**: These third-party tools require you to provide access to your Bluesky account. Review their privacy policies before proceeding.

<!-- step-end -->

<!-- step-start -->
<!-- step-meta
title: "Announce Your Move to Bluesky (Optional)"
-->

Let your X network know where to find you:

1. Post an announcement on X with your Bluesky handle
   - Example: "I'm now on Bluesky! Follow me @username.bsky.social #BlueskyMigration"
2. Pin this post to the top of your X profile
3. Add your Bluesky handle to your X bio
4. Consider sharing your Bluesky QR code (available in your profile settings)
5. Mention your move in X replies and conversations
6. Post regularly on both platforms during the transition period

<!-- step-end -->


<!-- step-start -->
<!-- step-meta
title: "Learn Bluesky-Specific Features (Optional)"
-->

Familiarize yourself with Bluesky's unique features:

1. **Custom Feeds**: Explore algorithmically curated or user-created feeds
   - Tap "Feeds" to discover different views of the network
   - Try creating your own custom feed around specific topics

2. **Content Labels**: Add content warnings or topic labels to your posts
   - Tap the label icon when composing a post
   - Select appropriate categories for sensitive content

3. **Post Length**: Bluesky has a 300 character limit (compared to X's 280)

4. **Custom Domain Handles**: Use your own domain as your handle
   - Own a domain (e.g., yourdomain.com)
   - Add a DNS TXT record pointing to your Bluesky DID
   - Update your handle in Bluesky settings

5. **Data Portability**: Your account can potentially move between providers
   - This is a future benefit of the AT Protocol

<!-- step-end -->

<!-- end-section -->

<!-- section:troubleshooting -->

## Troubleshooting

### Common Issues

- **Can't find people from X**: Not everyone has migrated. Use third-party tools like Sky Follower Bridge or search for people mentioning their Bluesky handles on X.

- **Missing verification**: Bluesky doesn't have the same verification system as X. Look for consistent usernames, profile pictures, and linked websites to confirm identities.

- **Timeline feels empty**: This is normal at first. Follow more accounts, check the Discover tab regularly, and give your network time to grow.

- **Import tools not working**: These are third-party tools and may experience downtime. Try again later or use alternative tools.

### Getting Help

If you encounter problems during migration:

- Visit [Bluesky Help Center](https://blueskyweb.zendesk.com/hc/en-us)
- Join Bluesky-focused communities on Discord or Reddit
- Search for solutions with hashtags like #BlueskyHelp or #BlueskyTips

<!-- end-section -->

<!-- section:outro -->

## Conclusion

Congratulations! You've successfully migrated from X to Bluesky. Your transition may take time as more of your network joins the platform, but you're now part of a growing decentralized social network that prioritizes user control and transparent development.

Remember that Bluesky is still evolving, with new features being added regularly. The platform's decentralized nature means that even if you don't like a particular interface or policy, you may eventually be able to switch clients while keeping your identity and connections.

Stay patient during your transition period, and consider maintaining your X presence until your Bluesky network is well-established.

<!-- end-section -->
