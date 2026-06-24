!macro customCheckAppRunning
  # Bypass the default running check which often fails with false positives.
  # Standard Windows file-locking mechanisms will handle any actual active processes during overwrite.
!macroend
