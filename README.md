# Wiki Graph Visualizer

This is a simple tool to visualize the graph of a fandom wiki.

## Requirements

[Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) are required to run this project.

## Installation

1. Clone this repository.
2. Run `npm install` to install the dependencies.
3. Run `npm run dev` to start the development server.
4. Open `http://localhost:5173` in your browser.

## Usage

![Commands](./tutorial/commands.jpg)

A list of commands is available in the sidebar. You can use these commands to navigate the graph.

![Selected](./tutorial/selected.jpg)

Click on a node to select it. The selected node will be highlighted and displayed in the sidebar. Selecting 2 nodes will display the information about the links between them (if any). Selecting more than 2 nodes will display only the information about the selected nodes.

![Search](./tutorial/search.jpg)

It's possible to search for a node by typing its name (exact match). The node will be set as the root of the graph.

![Root](./tutorial/root.jpg)

If a root is selected, the graph will show only the nodes that are reachable from the root.

![Category_Filter](./tutorial/category_filter.jpg)

It's possible to filter the nodes by category. The graph will show only the nodes that belong to the selected category. It's also possible to filter multiple categories.

![Multi_category](./tutorial/multi_category.jpg)

The graph will show only the nodes that belong to one of the selected categories.

![Degree_Filter](./tutorial/degree_filter.jpg)

It's possible to show only the nodes that have at least a certain degree (greater or equal).

![Combined_Filter](./tutorial/combined_filter.jpg)

It's possible to combine category and degree filter at the same time.

![Distribution](./tutorial/distribution.jpg)

By using the distribution command, it's possible to see the distribution of the nodes. Using the command again will hide the distribution and show the graph.

![Category_Distribution](./tutorial/category_distribution.jpg)

It's possible to see the distribution of the nodes by category. Only the nodes that belong to the selected category will be considered. It's not possible to combine this command with the degree filter or select more than one category.