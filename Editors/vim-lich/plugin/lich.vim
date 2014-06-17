
" Lich.js syntax highlighting, same as haskell
au BufNewFile,BufRead *.lich syntax on
au BufNewFile,BufRead *.lich set filetype=haskell

au BufNewFile,BufRead *.lich nnoremap <Leader>l :call LichToggle()<CR>
au BufNewFile,BufRead *.lich nnoremap <F12> :call LichHardStop()<CR>

" line ending for the interpreter
"let lichi_endl = "␄\n";

let g:lichmode_active = 0

" toggle in/out of Lich mode
function! LichToggle()

    if !g:lichmode_active
        let g:lichmode_active = 1
        exe LichModeStart()
    else
        let g:lichmode_active = 0
        exe LichModeEnd()
    endif

endfunction

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
    let g:lich_term = conque_term#open('node -i lichi.js')
    exe "cd -"
    let g:lich_interp_win = winnr()

    exe g:lich_main_win . "wincmd w"
    exe "echo 'Lich Mode active'"
endfunction

" close all Lich windows and quit the interpreter
function! LichModeEnd()

    exe g:lich_chat_win . "wincmd w | q"
    exe g:lich_interp_win . "wincmd w | q"

    exe "echo 'Lich Mode ended'"
endfunction

function! LichHardStop()
    " make this get sent to the terminal
python << EOF
import vim
vim.command("call g:lich_term.write(\"freeAll 0␄\n\")")
EOF
endfunction

" test stuff
function! Send()

python << EOF

code = "let test = a + b\n\twhere\n\t\ta = 1\n\t\tb = 1␄\n"
vim.command("call g:lich_term.write(\"" + code + "\")")

EOF

endfunction

"
" Modified version of vim-conque-repl to handle lichi specificly
"
if !exists('g:lichi_send_key')
    let g:lichi_send_key = '<F11>'
endif

let s:locked = 0
" Based on 'conque_term#send_selected'
fun! s:send_text(mode, all) 
    if s:locked
        return
    endif
    let s:locked = 1
    " Conque sets the 'updatetime' option to 50 in order to use the 
    " CursorHold hack to poll for program output and update the terminal
    " buffer.
    " The value of update_time is saved, since switching buffers with
    " the 'sb' command doesn't trigger the events conqueshell needs to restore
    " updatetime to its sane value, and making changes to the file buffer would
    " cause a lot of swap writes(:h updatetime).
    let saved_updatetime = &updatetime
    " get current buffer name
    let buffer_name = expand('%')
    " get most recent/relevant terminal
    let term = conque_term#get_instance()
    " Test the current mode to paste correctly in the term
    if a:mode == 2
        " Visual mode, get lines selected and if needed, strip the start/end 
        " of the first/last lines respectively.
        let [lnum1, col1] = getpos("'<")[1:2]
        let [lnum2, col2] = getpos("'>")[1:2]
        let text = getline(lnum1, lnum2)
        let text[0] = text[0][col1-1 :]
        let text[-1] = text[-1][: col2-1]
    else
        if a:all
            let text = getline(1,'$')
        else
            let text = [getline('.')]
        endif
    endif
    call term.focus()
    for line in text
        "call term.write("\n" . line)
    endfor
python << EOF
import vim

lines = vim.eval("text")

code = ""

for line in lines:
    code = code + str(line) + "\n"

# add lichi line ending to compile
vim.command("call g:lich_term.write(\"" + code + "␄\n\")")
EOF
    " scroll buffer left
    startinsert!
    normal! 0zH
    " If the buffers were switched in the current call stack, the terminal
    " buffer would not be updated, and the eval results would not be visible. 
    call s:after_ui_refresh('s:switch_buffer', [buffer_name, a:mode, saved_updatetime])
endfun

fun! s:switch_buffer(buffer_name, mode, saved_updatetime) 
    augroup lichi_timeout
        autocmd!
    augroup END
    let &updatetime = a:saved_updatetime
    let save_sb = &switchbuf
    sil set switchbuf=usetab
    exe 'sb ' . a:buffer_name
    let &switchbuf = save_sb
    if a:mode > 0
        stopinsert " Stop insert if was in normal or visual mode
        if a:mode == 2
            " Reselect previous selected text
            normal! gvl
        endif
    endif
    let s:locked = 0
endfun

fun! s:after_ui_refresh(F, args)
    let s:temp_function_name = a:F
    let s:temp_function_args = a:args
    augroup lichi_timeout
        autocmd!
        autocmd CursorHoldI * call call(s:temp_function_name, s:temp_function_args)
    augroup END
endfun

command! ConqueTermSendLineInsert :call s:send_text(0, 0)
command! ConqueTermSendLineNormal :call s:send_text(1, 0)
command! -range ConqueTermSendSelection :call s:send_text(2, 0) 
command! ConqueTermSendBufferInsert :call s:send_text(0, 1) 
command! ConqueTermSendBufferNormal :call s:send_text(1, 1) 

if g:lichi_send_key != '' && ! maparg(g:lichi_send_key)
    exe 'inoremap <silent>' g:lichi_send_key '<ESC>:ConqueTermSendLineInsert<CR>'
    exe 'nnoremap <silent>' g:lichi_send_key ':ConqueTermSendLineNormal<CR>'
    exe 'vnoremap <silent>' g:lichi_send_key ':ConqueTermSendSelection<CR>'
endif

