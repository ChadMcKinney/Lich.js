;;lich-mode.el

(global-unset-key (kbd "C-<return>"))
(setq cua-rectangle-mark-key (kbd "C-S-<return>"))

;;Define lich-mode
(define-minor-mode lich-mode
  "Toggle Lich mode.
     Interactively with no argument, this command toggles the mode.
     A positive prefix argument enables the mode, any other prefix
     argument disables it.  From Lisp, argument omitted or nil enables
     the mode, `toggle' toggles the state.
     
     When Lich mode is enabled all hell breaks loose."

  ;; The initial value.
  :init-value nil

  ;; The indicator for the mode line.
  :lighter " Lich"

  ;;Lich is a global mode
  :global t
  
  ;; The minor mode bindings.
  :keymap
  (let ((map (make-sparse-keymap)))
    (define-key map (kbd "C-<return>") 'lich-compile-line)
    (define-key map (kbd "C-T") 'lich-chat)
    (define-key map (kbd "C-U") 'lich-add-user)
    (define-key map (kbd "C-<up>") 'lich-backward-paragraph-onto-line)
    (define-key map (kbd "C-<down>") 'lich-forward-paragraph-onto-line)
    (define-key map (kbd "C-.") 'lich-free-all)
    ;; (define-key map (kbd "C-I") 'lich-remove-user)
    map)
  
  :group 'lich

  :after-hook (setup-lich-mode) )



(defun setup-lich-mode ()
  "Sets up emacs for Lich mode"

  (if (and (boundp 'lich-mode) lich-mode)
      (lich-create-windows )
    (lich-destroy-windows ))
  (setq lich-users (list user-login-name) )
  (lich-setup-process )
  (if (null lich-path)
       (setq lich-path "" )) )



(defun lich-set-path (path)
  "Sets the path to your Lich.js folder"
  (setq lich-path path))



(defun lich-setup-process ()
  "Sets up the lichi process for lich-mode, assumes node is in path, and the Lich.js folder is in lich-path"
  
  (setq lich-process (start-process "lich-process" "*lich-post*" "node" (concat lich-path "Lich.js\\Local\\lichi.js")) )
  (set-process-query-on-exit-flag lich-process nil ))



(defun lich-create-windows ()
  "Creates the windows necessary for lich-mode"

  ;;sets the current window as the code window
  (setq lich-code-window (get-buffer-window (current-buffer)) )

  ;;creates a new window horizontal to the current window that is the chat window
  (setq lich-chat-window (split-window-horizontally) )
  (window-resize lich-chat-window (- (truncate (* 0.2 (frame-width))) (window-width lich-chat-window)) t)
  (select-window lich-chat-window )
  (get-buffer-create "*lich-chat*")
  (switch-to-buffer "*lich-chat*")
  (setq mode-line-format nil)
  ;; (setq buffer-read-only t)
  
  ;;creates a new window vertical to the chat window that is the post window
  (setq lich-post-window (split-window-vertically) )
  ;; (window-resize lich-post-window (- (truncate (* 0.333 (frame-height))) (window-height)) t)
  (select-window lich-post-window )
  (setq lich-post-window-height (window-height))
  (get-buffer-create "*lich-post*")
  (switch-to-buffer "*lich-post*")
  (setq mode-line-format nil)
  ;; (setq buffer-read-only t)
  
  ;;selects the code window
  (select-window lich-code-window )
  (setq lich-user-windows (list (list user-login-name lich-code-window)) )

  (add-hook 'kill-emacs-hook 'lich-disable-mode-on-exit) )



(defun lich-disable-mode-on-exit ()
  "Disables lich-mode when you exit emacs"
  (lich-mode -1) )



(defun lich-destroy-windows ()
  "Cleans up the windows in lich-mode"

  
  (if (window-live-p lich-chat-window )
      (window--delete lich-chat-window ))
  (if (window-live-p lich-post-window )
      (window--delete lich-post-window ))

  (if (get-buffer "*lich-chat*" )
      (kill-buffer "*lich-chat*" ))
  
  (if (get-buffer "*lich-post*" )
      (kill-buffer "*lich-post*" ))

  (process-send-string lich-process "close")
  
  ;; (send-
  ;; (interrupt-process lich-process)
  ;; (interrupt-process lich-process)
  ;; (quit-process lich-process)
  ;; (kill-process lich-process)

  (mapcar 'lich-kill-user-window lich-user-windows ))



(defadvice save-buffers-kill-emacs (around no-query-kill-emacs activate)
  "Prevent annoying \"Active processes exist\" query when you quit Emacs."
  (flet ((process-list ())) ad-do-it))



(defun lich-print (print-string)
  "Prints a string to the lich post window"
  
  (save-current-buffer
    (set-buffer "*lich-post*")

    (end-of-buffer)

    ;;clear the buffer if it's too many lines
    (if (> (count-lines (point-min) (point-max)) lich-post-window-height )
	(delete-region (point-min) (point-max)))
    (insert print-string) ))


(defun lich-print-with-break (print-string)
  "Prints a string to the lich post window"
  
  (save-current-buffer
    (set-buffer "*lich-post*")

    (end-of-buffer)

    ;;clear the buffer if it's too many lines
    (if (> (count-lines (point-min) (point-max)) lich-post-window-height )
	(delete-region (point-min) (point-max)))
    (insert (concat print-string "\n")) ))


(defun lich-chat (chat-string)
  "Sends out a chat to the network"
  (interactive "schat: ")

  (save-current-buffer
    (set-buffer "*lich-chat*")

    (end-of-buffer)
    
    ;;clear the buffer if it's too many lines
    (if (> (count-lines (point-min) (point-max)) lich-post-window-height )
	(delete-region (point-min) (point-max)))
    (insert (concat (concat (concat user-login-name ": ") chat-string) "\n") )))


(defun lich-add-user (user-name)
  "Adds a user to the group"
  (interactive "sUser-name: ")

  (if (not (member user-name lich-users))
      (setq lich-users (cons user-name lich-users) ))
  (lich-print-with-break (concat user-name " joined. Current Users: "))
  (mapcar 'lich-print-with-break lich-users )
  (lich-print "\n")

  ;;split the window
  (split-window-vertically )
  
  ;;do some window juggling
  (setq lich-user-window (selected-window) )

  ;;Setup the new window
  (get-buffer-create (concat (concat "*lich-code-" user-name) ".lich*") )
  (switch-to-buffer (concat (concat "*lich-code-" user-name) ".lich*") )
  (setq mode-line-format  nil )

  ;;add new window to users window list
  (add-to-list 'lich-user-windows (list user-name lich-user-window) )
  
  ;;Go back to our own code window
  (other-window 1)
  ;; (other-window (- (length lich-users) 1) )
  (setq lich-code-window (selected-window) )

  ;;reset our code window in our list
  ;; (assq-delete-all user-login-name lich-user-windows)
  (setq lich-user-windows (delq (assoc user-login-name lich-user-windows) lich-user-windows) )

  (add-to-list 'lich-user-windows (list user-login-name lich-code-window) )

  ;;resize all of the windows correctly
  (mapcar 'lich-resize-window lich-user-windows ))



(defun lich-remove-user (user-name)
  "Remove a user to the group"
  (interactive "sUser-name: ")
  
  (setq lich-users (remove user-name lich-users) )
  (lich-print-with-break (concat user-name " left. Current Users: ") )
  (mapcar 'lich-print-with-break lich-users)
  (lich-print "\n")
  
  (if (window-live-p (car (cdr (assoc user-name lich-user-windows))))
      (window--delete (car (cdr (assoc user-name lich-user-windows))) ))
  
  (setq lich-user-windows (delq (assoc user-name lich-user-windows) lich-user-windows) )
  
  ;; (lich-print-alist "lich-user-windows" lich-user-windows )
  )



(defun lich-print-alist (tag alist)
  "Prints an alist"
  (lich-print (concat (concat "\n" tag) ": \n\n") )
  (mapcar 'lich-print-alist-item alist )) 



(defun lich-print-alist-item (alist-item)
  "Prints an individual item in an alist"
  (lich-print "( " )
  (lich-print (car alist-item) )
  (lich-print " " )
  (lich-print (prin1-to-string (car (cdr alist-item))) )
  (lich-print " )\n" ))



(defun lich-resize-window (name-window-pair)
  "Resizes the windows in lich-mode"
  (if (eq (car name-window-pair) user-login-name)
      (lich-resize-our-window (car (cdr name-window-pair)) )
     (lich-resize-other-window (car (cdr name-window-pair)) )))



(defun lich-resize-our-window (window)
  "Resizes our own window"
  (window-resize window
		 (- (truncate (* 0.6 (frame-height)) )
		    (window-height window ))))



(defun lich-resize-other-window (window)
  "Resizes everyone else's window"
  (window-resize window
		 (- (truncate (* (/ 0.4 (- (length lich-users) 1))) (frame-height) )
		    (window-height window ))))



(defun lich-kill-user-window (name-window-pair)
  "Kill extra lich windows"
  (if (not (eq (car name-window-pair) user-login-name))
      (if (window-live-p (car (cdr name-window-pair)))
	  (window--delete (car (cdr name-window-pair)) ))))



(defun lich-compile-line ()
  "Compile Lich code."
  (interactive)
  ;; get current selection or line
  (let (bds p0 p1 p2 code-string)

    (setq p0 (point))
    
    ;; get boundary
    ;;If there is a region selected, get the boundaries of the selection
    ;; otherwise set the boundaries to the current line
    (if (region-active-p)
	(progn (setq bds (cons (region-beginning) (region-end) ))
	       (setq p1 (car bds) )
	       (setq p2 (cdr bds) ))
      (progn (beginning-of-line)
	     (forward-char 1)
	     (setq p1 (re-search-backward "^[^[:blank:]\\n\\r\\t]"))
	     (beginning-of-line)
	     (forward-char 1)
	     (setq p2 (- (re-search-forward "^[^[:blank:]\\n\\r\\t]") 1))
	     (goto-char p0) ))

    
    ;; grab the string
    (setq code-string (buffer-substring-no-properties p1 p2) )

    (process-send-string lich-process (concat code-string "\n") )

    (let (temp-buf)

      (setq temp-buf (current-buffer))

      (set-buffer "*lich-post*")
      
      ;;clear the buffer if it's too many lines
      (if (> (count-lines (point-min) (point-max)) lich-post-window-height )
	  (delete-region (point-min) (point-max)) )

      (set-buffer temp-buf ))))

(defun lich-backward-paragraph-onto-line ()
  "The same as backward-paragraph only the point is moved onto the next line instead of staying on a blank line"
  (interactive)

  ;;check to see if we are one below comment
  ;;if we are we have to move a line up, otherwise we get cockblocked by the comment.
  (let (p0 c1 c2)

    (setq p0 (point))
    (beginning-of-line)
    (backward-char)
    (beginning-of-line)
    (setq c1 (char-after))
    (forward-char 1)
    (setq c2 (char-after))
    (goto-char p0)

    (if (and (equal c1 ?-) (equal c2 ?-))
	;; (backward-line 1)
	(progn 
	  (beginning-of-line)
	  (backward-char)
	  (beginning-of-line))
      ))

  ;;do actual movement
  (backward-char 1)
  (backward-paragraph)
  (forward-char 1)

  ;;check to see if we are on a lich comment, if we are, move forward one more to be on actual code
  (let (p0 c1 c2)

    (setq p0 (point))
    (beginning-of-line)
    (setq c1 (char-after))
    (forward-char 1)
    (setq c2 (char-after))
    (goto-char p0)

    (if (and (equal c1 ?-) (equal c2 ?-))
	(forward-line 1)
      )))


(defun lich-forward-paragraph-onto-line ()
  "The same as backward-paragraph only the point is moved onto the next line instead of staying on a blank line"
  (interactive)
  (forward-paragraph)
  (forward-char 1)

  ;;check to see if we are on a lich comment, if we are, move forward one more line to be on actual code
  (let (p0 c1 c2)

    (setq p0 (point))
    (beginning-of-line)
    (setq c1 (char-after))
    (forward-char 1)
    (setq c2 (char-after))
    (goto-char p0)
          
    (if (and (equal c1 ?-) (equal c2 ?-))
	(forward-line 1)
      )))


(defun lich-free-all ()
  "This frees all the nodes running on scsynth"
  (interactive)
  
  (process-send-string lich-process "freeAll\n"))
