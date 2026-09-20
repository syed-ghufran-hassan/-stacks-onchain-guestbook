(define-map messages
  { id: uint }
  {
    author: principal,
    message: (string-ascii 200),
    timestamp: uint
  }
)

(define-data-var message-count uint u0)

(define-public (write-message (message (string-ascii 200)))
  (let ((id (var-get message-count)))
    (map-set messages
      { id: id }
      {
        author: tx-sender,
        message: message,
        timestamp: stacks-block-height
      }
    )
    (var-set message-count (+ id u1))
    (ok id)
  )
)

(define-read-only (get-message (id uint))
  (map-get? messages { id: id })
)

(define-read-only (get-message-count)
  (var-get message-count)
)