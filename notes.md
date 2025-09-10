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
| View About page                                     |                    |                   |              |
| View History page                                   |                    |                   |              |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) |                    |                   |              |
| View franchise<br/>(as franchisee)                  |                    |                   |              |
| Create a store                                      |                    |                   |              |
| Close a store                                       |                    |                   |              |
| Login as admin<br/>(a@jwt.com, pw: admin)           |                    |                   |              |
| View Admin page                                     |                    |                   |              |
| Create a franchise for t@jwt.com                    |                    |                   |              |
| Close the franchise for t@jwt.com                   |                    |                   |              |
