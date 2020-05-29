(define-constant completed true ) ;; constant task status completed
  
(define-constant inProgress false );; constant task status inprogress

(define-map tasks ;; mapping to store all Tasks  
  ((taskID int)  )
  ((task (buff 40)) (completed bool))) 
 
 
(define-data-var numberOfTasks int 0) ;; variable to track number of Tasks
 
 
 
(define-private (incrementTasks)  ;; incress number of Tasks counter
    (begin
     (var-set numberOfTasks (+ (var-get numberOfTasks) 1))
     (ok (var-get numberOfTasks)))) 

(define-private (getTask (taskID int) ) ;; contract only to get Task name
  (begin
  (default-to " "
    (get task
         (map-get? tasks ((taskID taskID) ))))
         ))

(define-private (getTaskStatus (taskID int) ) ;; contract only to get Task complete status
  (begin
  (default-to inProgress
    (get completed
         (map-get? tasks ((taskID taskID) ))))
         ))
 (define-public (getNumberOfTasks)  ;; to get number of Tasks registered
   (ok (var-get numberOfTasks)))
 
(define-public (getTaskName (taskID int)  ) ;; to get a  Task name by id
  (let ((task (getTask taskID)))
    (begin
    (ok task)
      )))

(define-public (getTaskCompleteStatus (taskID int)  ) ;; to get Task complete status by id
  (let ((status (getTaskStatus taskID)))
    (begin
    (if status 
    (ok 1) ;; completed =1
     (ok 0) ;; inprogress=0
     )
      ))) 

(define-public (addTask  ( task (buff 40)))   ;; to register new Task
      (begin    
    (map-set tasks ((taskID (+ (var-get numberOfTasks) 1))) ((task task)
       (completed inProgress))) 
      (incrementTasks   )
       (ok 1)
    )   
    ) 
    
(define-public (toggleTaskStatus    (taskID int))    
    (let ((task (getTask taskID))    (completedStatus (getTaskStatus taskID)))
        (if  (and (> taskID 0) (<= taskID (var-get numberOfTasks) ) ;; validating  taskID
             )
            (begin ;; 
        (map-set tasks ((taskID taskID)) ((task task)
       (completed  (not completedStatus ) ))) ;; toggle complete status
       
    (ok 1) ;; return ok
      )      
   (err 0)) ;; return error when one of validation condations failed
    ))
 
 

 
