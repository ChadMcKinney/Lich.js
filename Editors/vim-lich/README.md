An editor for the Lich live coding language using VIM.

Dependencies
-ConqueTerm https://code.google.com/p/conque/
-Conque-REPL https://github.com/tarruda/vim-conque-repl

Usage
You need to set this in your .vimrc
let g:lichi_path = "path/to/Lich.js/Local"

Then open a .lich file and run
:call LichModeStart()

You should then have a window that will be for chat (eventually) and a running interpreter. To close everything when you are done run
:call LichModeEnd()

Later I will map these to keys, or you can do that yourself in your .vimrc
