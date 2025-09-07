## Warning

-   Obsidian stores each view in an array without a unique identifier which makes it that the first of multiple identical tables will be modified.
-   The controller object is vital for the program to detect which view is currently being used. It only appears when you make updates to the file.
    -   UPDATE 1: I don't know why but the controller now always appear.
    -   UPDATE 2: This only happens when clicking the menu item on the file-menu. The editor-menu does not have this problem.

## Discoveries

-   (Bug) Obsidian does not support same name views. The second view would take the config of the first view. If you name two tables the same name this will occur.
    -   (Solution) If you change the name of the 2nd table to make it unique it will revert to its original config.
