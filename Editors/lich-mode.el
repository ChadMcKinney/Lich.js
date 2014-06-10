;;lich-mode.el

(require 'thingatpt)

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
            (define-key map (kbd "M-RET") 'compile-lich-line)
            map)

  :group 'lich

  :after-hook (setup-lich-mode)
  )

;;Compile the current line!
(defun compile-lich-line ()
  "Compile Lich code."
  (interactive)
  ;; get current selection or line
  (let (bds p1 p2 code-string)
    
    ;; get boundary
    ;;If there is a region selected, get the boundaries of the selection
    ;; otherwise set the boundaries to the current line
    (if (region-active-p)
	(setq bds (cons (region-beginning) (region-end) ))
      (setq bds (bounds-of-thing-at-point 'line)) )
    (setq p1 (car bds) )
    (setq p2 (cdr bds) )
     
    ;; grab the string
    (setq code-string (buffer-substring-no-properties p1 p2)  )
     
    ;; do something with inputStr here
    ;; (print code-string)
    (lich-print code-string)
    ) )

;;Setup code for lich-mode
(defun setup-lich-mode ()
  "Sets up emacs for Lich mode"

  (if (and (boundp 'lich-mode) lich-mode)
      (create-lich-windows)
    (destroy-lich-windows) )
  )

;;Creates windows necessary for Lich
(defun create-lich-windows ()
  "Creates the windows necessary for lich-mode"

  ;;sets the current window as the code window
  (setq lich-code-window (get-buffer-window (current-buffer)) )

  ;;creates a new window horizontal to the current window that is the chat window
  (setq lich-chat-window (split-window-horizontally) )
  (window-resize lich-chat-window (- (truncate (* 0.2 (frame-width))) (window-width)) t)
  (select-window lich-chat-window )
  (get-buffer-create "lich-chat")
  (switch-to-buffer "lich-chat")
  ;; (setq buffer-read-only t)
  
  ;;creates a new window vertical to the chat window that is the post window
  (setq lich-post-window (split-window-vertically) )
  ;; (window-resize lich-post-window (- (truncate (* 0.333 (frame-height))) (window-height)) t)
  (select-window lich-post-window )
  (setq lich-post-window-height (window-height))
  (get-buffer-create "lich-post")
  (switch-to-buffer "lich-post")
  ;; (setq buffer-read-only t)
  
  ;;selects the code window
  (select-window lich-code-window )

  (add-hook 'kill-emacs-hook 'disable-lich-mode-on-exit)
  )

(defun disable-lich-mode-on-exit ()
  "Disables lich-mode when you exit emacs"
  (lich-mode -1)
  )

;;Cleans up windows after we are done with lich
(defun destroy-lich-windows ()
  "Creates the windows necessary for lich-mode"

  (delete-window lich-chat-window)
  (delete-window lich-post-window)
  (kill-buffer "lich-chat")
  (kill-buffer "lich-post")
  )


;;Prints text to the lich console
(defun lich-print (print-string)
  "Prints a string to the lich post window"
  
  (save-current-buffer
    (set-buffer "lich-post")
    ;;clear the buffer if it's too many lines
    (if (> (count-lines (point-min) (point-max)) lich-post-window-height )
	(delete-region (point-min) (point-max)))
    (insert print-string)
    )
  )
  
