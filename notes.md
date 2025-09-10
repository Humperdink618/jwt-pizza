# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      |     home.tsx       |       none        |    none      |
| Register new user<br/>(t@jwt.com, pw: test)         |     register.tsx   |  [POST]/api/auth  |    INSERT INTO user (name, email, password) VALUES (?, ?, ?)          |
| Login new user<br/>(t@jwt.com, pw: test)            |     login.tsx      | [PUT]/api/auth    |  INSERT INTO auth (token, userId) VALUES (?, ?) ON DUPLICATE KEY UPDATE token=token            |
| Order pizza                                         | menu.tsx, payment.tsx       | [POST]/api/order                  | INSERT INTO dinerOrder (dinerId, franchiseId, storeId, date) VALUES (?, ?, ?, now())             |
| Verify pizza                                        |     delivery.tsx   |   none                |    none          |
| View profile page                                   |    dinerDashboard.tsx                |  [GET]/api/order                 |    SELECT id, menuId, description, price FROM orderItem WHERE orderId=?          |
| View franchise<br/>(as diner)                       |   franchiseDashboard.tsx                 | [GET]/api/franchise/:userId                  |   SELECT objectId FROM userRole WHERE role='franchisee' AND userId=?           |
| Logout                                              |  logout.tsx                  |   [DELETE]/api/auth                |   DELETE FROM auth WHERE token=?           |
| View About page                                     |  about.tsx         |  none             |  none        |
| View History page                                   |  history.tsx       |  none             |  none        |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) |  login.tsx         |  [PUT]/api/auth   |  INSERT INTO auth (token, userId) VALUES (?, ?) ON DUPLICATE KEY UPDATE token=token            |
| View franchise<br/>(as franchisee)                  |  franchiseDashboard.tsx, login.tsx                  | [GET]/api/franchise/:userId                  | SELECT userId FROM auth WHERE token=?; SELECT objectId FROM userRole WHERE role='franchisee' AND userId=? ;
SELECT u.id, u.name, u.email FROM userRole AS ur JOIN user AS u ON u.id=ur.userId WHERE ur.objectId=? AND ur.role='franchisee' ;
SELECT s.id, s.name, COALESCE(SUM(oi.price), 0) AS totalRevenue FROM dinerOrder AS do JOIN orderItem AS oi ON do.id=oi.orderId RIGHT JOIN store AS s ON s.id=do.storeId WHERE s.franchiseId=? GROUP BY s.id            |
| Create a store                                      |  franchiseDashboard.tsx, createStore.tsx                  |  [POST]/api/franchise                 |  INSERT INTO store (franchiseId, name) VALUES (?, ?)            |
| Close a store                                       |  franchiseDashboard.tsx, closeStore.tsx                  |  [DELETE]/api/franchise/:franchiseId/store/:storeId                 | DELETE FROM store WHERE franchiseId=? AND id=?             |
| Login as admin<br/>(a@jwt.com, pw: admin)           |  login.tsx         |  [PUT]/api/auth   |  INSERT INTO auth (token, userId) VALUES (?, ?) ON DUPLICATE KEY UPDATE token=token            |
| View Admin page                                     |  adminDashboard.tsx  | [GET]/api/franchise?page=0&limit=10&name=*  | SELECT u.id, u.name, u.email FROM userRole AS ur JOIN user AS u ON u.id=ur.userId WHERE ur.objectId=? AND ur.role='franchisee' ;
SELECT s.id, s.name, COALESCE(SUM(oi.price), 0) AS totalRevenue FROM dinerOrder AS do JOIN orderItem AS oi ON do.id=oi.orderId RIGHT JOIN store AS s ON s.id=do.storeId WHERE s.franchiseId=? GROUP BY s.id             |
| Create a franchise for t@jwt.com                    |  adminDashboard.tsx, createFranchise.tsx   | [POST]/api/franchise                  |  SELECT id, name FROM user WHERE email=? ; INSERT INTO franchise (name) VALUES (?) ; INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)            |
| Close the franchise for t@jwt.com                   |  adminDashboard.tsx, closeFranchise.tsx      | [DELETE]/api/franchise/:franchiseId    | DELETE FROM store WHERE franchiseId=? ;
DELETE FROM userRole WHERE objectId=? ;
DELETE FROM franchise WHERE id=?             |
