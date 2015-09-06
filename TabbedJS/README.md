# TabbedJS
Light-weight, cross-browser javascript tab management library for easy integration of tabbing elements without any external dependencies.

## How to use
TabbedJS starts automatically as soon as the page loads.
To create a tab, give each tab element the class "tab" and the content should have the class "tabContent".
Each tag should also have a data-tabgroup attribute with the name of the group of tabs it belongs to, as well as a data-tabname attribute. The the data-tabname should be the same between an individual tab and its tabContent, but each pairing of tab and tabContent should have different names.
To set a tab as active by default, add the class name "active" to both the tab and tabContent. By default, inactive tabContent has the style display:none, while active tabContent has display:block. This can be overriden by adding ".tabContent" and ".tabContent.active" CSS rules to your stylesheets.

For dynamically generated tabs / content, whenever anything new is added, call Tabs.updateAll() in JavaScript to update the tab manager.
To dynamically swap between tabs with JavaScript, call Tabs.swapTab(group,name) where group is the tabgroup and name is the tabname.