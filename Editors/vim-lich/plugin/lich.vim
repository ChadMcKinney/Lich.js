" start up the chat and interpreter for Lich
function! LichModeStart()

    " save reference to out main window
    let g:lich_main_win = winnr()

    " create the chat window
    exe "vsplit | vertical res 50"
    let g:lich_chat_win = winnr()

    " create the Lich interpreter
    let g:ConqueTerm_FastMode = 0
    let g:ConqueTerm_Color = 0
    let g:ConqueTerm_StartMessages = 0
    exe "split | res -5 | cd `=g:lichi_path`"
    let g:lich_term = conque_term#open('node -i lichi')
    exe "cd -"
    let g:lich_interp_win = winnr()

    exe g:lich_main_win . "wincmd w"
endfunction

" close all Lich windows and quit the interpreter
function! LichModeEnd()

exe g:lich_chat_win . "wincmd w | q"
exe g:lich_interp_win . "wincmd w | q"

endfunction

" test stuff
function! Send()

python << EOF

code = "let test = a + b where a = 1; b = 1\n"

vim.command("call g:lich_term.write(\"" + code + "\")")

EOF

endfunction

