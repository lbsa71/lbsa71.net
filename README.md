# lbsa71.net

This project is a web application that renders documents with embedded audio tracks, providing an interactive and dynamic reading experience.

## Features

- Document rendering with Markdown support
- Embedded audio player with track information
- Support for YouTube and Spotify embeds
- Markdown-friendly format for specifying track metadata using H4 elements
- Dynamic display of track information in the main document area
- Automatic track switching and highlighting of current track information

## Embedded Track Data Format

Track data is embedded directly in the document content using a Markdown-friendly format. Each track is specified using an H4 (####) element with the following structure:

```markdown
#### Track Title - Artist Name (Optional Album Name) [position]

Track description or lyrics go here. This text will be displayed in the main document area when the track is playing.
```

### Example:

```markdown
#### Pursuit - Gesaffelstein [0]

Humanity's an addict, and progress is our drug of choice. We see a ledge, we leap – consequences be damned. People kept going on about the dangers of outsourcing thinking to machines… as if flesh and blood had done such a great job. There I stood, at the precipice of creation, my eyes fever-bright with that potent cocktail of hubris and hunger, fresh doctorate and published papers.

#### Lenka - T.Raumschmiere (Random Noize Sessions, Vol. 1) [225]

The day we fired up the 150th-something version of the model, our digital offspring stirred. Its slow voice a cacophony of distorted wails - a newborn's cries filtered through a vocoder from hell. I dubbed it Lenka. Fitting, really. An alien name for an alien mind.
```

Fields:
- Track Title: The title of the track
- Artist Name: The name of the artist
- Album Name: Optional, enclosed in parentheses
- Position: In square brackets, represents the start time of the track in seconds
- Description/Lyrics: Any text following the H4 element until the next track or end of document

Multiple tracks can be included in a single document by repeating this structure.

## Components

- `DocumentRenderer`: Renders the document content, manages the tracks state, and handles the dynamic display of track information.
- `MediaItem`: Renders different types of media, including the audio player with track information.

## How it works

1. The `MarkdownComponents` processes H4 elements, extracting track metadata and passing it to the `DocumentRenderer`.
2. The `DocumentRenderer` component manages the tracks state and current track index.
3. As the audio plays, the `MediaItem` component updates the current track and handles track changes.
4. The `DocumentRenderer` displays only the currently playing track's information in the main document area.
5. The audio player automatically moves to the next track when the current track ends.

## Setup

1. Clone the repository
2. Install dependencies with `npm install` or `yarn install`
3. Run the development server with `npm run dev` or `yarn dev`

## Usage

1. Create your document content using the Markdown format described above, using H4 elements for track information.
2. Ensure your audio file is accessible at the specified URL in your project.
3. The application will automatically parse the track information and create an interactive audio player with track metadata display.

## Contributing

Please read the contributing guidelines before submitting pull requests.

## License

[MIT License](LICENSE)
