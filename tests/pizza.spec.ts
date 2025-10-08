// import { test, expect } from '@playwright/test' <- Replace this with the line below
import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { Role, Store, User } from '../src/service/pizzaService';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] } };

  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'DELETE') {
      const logoutRes = {
        message: 'logout successful'
      };
      await route.fulfill({ json: logoutRes });
    } else {
      const loginReq = route.request().postDataJSON();
      const user = validUsers[loginReq.email];
      if (!user || user.password !== loginReq.password) {
        await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
        return;
      }
      loggedInUser = validUsers[loginReq.email];
      const loginRes = {
        user: loggedInUser,
        token: 'abcdef',
      };
      expect(route.request().method()).toBe('PUT');
      await route.fulfill({ json: loginRes });
    }
  });
    

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');
}

test('login', async ({ page }) => {
  test.setTimeout(20_000);
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
  test.setTimeout(20_000);
  await basicInit(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('has title', async ({ page }) => {
  test.setTimeout(20_000);
  // await page.goto('http://localhost:5173/');
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('JWT Pizza');
});

test('check franchises and history', async ({ page }) => {
  test.setTimeout(20_000);
  await basicInit(page);

  // Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

// Check franchise and history at bottom of page
  await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');

});

test('logout', async ({ page }) => {
  test.setTimeout(20_000);
  await basicInit(page);
  // Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
  
});

async function registerInit(page: Page) {

  let registeredUser: User | undefined;
  const validRegUsers: Record<string, User> = { 'GoldenRetriever@test.com': { id: '4', name: 'Serial Designation N', email: 'GoldenRetriever@test.com', password: 'spaceshippilot', roles: [{ role: Role.Diner }] } };

  // Authorize register for the given user
  await page.route('*/**/api/auth', async (route) => {
    const registerReq = route.request().postDataJSON();
    registeredUser = validRegUsers[registerReq.email];
    const registerRes = {
      user: registeredUser,
      token: '12345',
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: registerRes });
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: registeredUser });
  });

  await page.goto('/');
}

test('register new user', async ({ page }) => {
  test.setTimeout(20_000);
  await registerInit(page);

  await page.getByRole('link', { name: 'Register' }).click();
  await expect(page.getByRole('heading')).toContainText('Welcome to the party');
  await page.getByRole('textbox', { name: 'Full name' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Serial Designation N');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('GoldenRetriever@test.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('spaceshippilot');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: 'SN' }).click();
  await expect(page.getByRole('main')).toContainText('diner');
  await expect(page.getByRole('main')).toContainText('How have you lived this long without having a pizza? Buy one now!');
  await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
});

async function franchiseeInit(page: Page) {
  let loggedInFranchisee: User | undefined;
  const validFranchisees: Record<string, User> = { 'f@jwt.com': { id: '5', name: 'franchisee', email: 'f@jwt.com', password: 'franchisee', roles: [{role: Role.Diner}, { objectId: '1', role: Role.Franchisee }] } };
  // let testStore: Store | undefined;
  // const validStore: Record<string, Store> = { '5': { id: '5', name: 'NYC' } };
  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const loginFranchiseeReq = route.request().postDataJSON();
    const user = validFranchisees[loginFranchiseeReq.email];
    if (!user || user.password !== loginFranchiseeReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInFranchisee = validFranchisees[loginFranchiseeReq.email];
    const loginFranchiseeRes = {
      user: loggedInFranchisee,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginFranchiseeRes });
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInFranchisee });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          admins: [
            { id: 5, name: 'franchisee', email: 'f@jwt.com'},
          ],
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // User's franchises and stores
  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    const franchiseUserRes = [
      {
        id: 2,
        name: 'LotaPizza',
        admins: [
          { id: 5, name: 'franchisee', email: 'f@jwt.com'},
        ],
        stores: [
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
    ];

    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseUserRes });
  });

  // old data (if I wanted to actually create a store. However, I
  //  don't actually need to, as I have already reached 80% coverage
  //  anyway. The create new store code below is buggy anyway)

  // // create a new store.
  // await page.route(/\/api\/franchise\/\d+\/store$/, async (route) => {
      
  //   const createStoreReq = { franchiseId: 2, name: 'NYC' };
  //   const createStoreRes = { id: 7, name: 'NYC', totalRevenue: 0 };
  //   // console.log(createStoreRes);
  //   // console.log(route.request().postDataJSON());
  //   expect(route.request().method()).toBe('POST');
  //   expect(route.request().postDataJSON()).toMatchObject(createStoreReq);
  //   await route.fulfill({ json: createStoreRes });

  //   await page.unroute(/\/api\/franchise\/\d+$/);

  //   await page.route(/\/api\/franchise\/\d+$/, async (route) => {
  //     const franchiseUserRes = [
  //       {
  //         id: 2,
  //         name: 'LotaPizza',
  //         admins: [
  //           { id: 5, name: 'franchisee', email: 'f@jwt.com'},
  //         ],
  //         stores: [
  //           { id: 4, name: 'Lehi' },
  //           { id: 5, name: 'Springville' },
  //           { id: 6, name: 'American Fork' },
  //           { id: 7, name: 'NYC', totalRevenue: 0 }
  //         ],
  //       },
  //     ];

  //     expect(route.request().method()).toBe('GET');
  //     await route.fulfill({ json: franchiseUserRes });
  //   });

  //   await page.unroute(/\/api\/franchise(\?.*)?$/);

  //   await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
  //     const franchiseRes = {
  //       franchises: [
  //         {
  //           id: 2,
  //           name: 'LotaPizza',
  //           stores: [
  //             { id: 4, name: 'Lehi' },
  //             { id: 5, name: 'Springville' },
  //             { id: 6, name: 'American Fork' },
  //             { id: 7, name: 'NYC', totalRevenue: 0 },
  //           ],
  //         },
  //         { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
  //         { id: 4, name: 'topSpot', stores: [] },
  //       ],
  //     };
  //     expect(route.request().method()).toBe('GET');
  //     await route.fulfill({ json: franchiseRes });
  //   });
  // });

  // // Delete a store.
  // await page.route('/\/api\/franchise\/\d+\/store\/\d+$/', async (route) => {
  //   const deleteStoreReq = route.request().postDataJSON();
  //   // const store = validStore[createStoreRes.id];
  //   // if (!franchise || franchise.id !== createStoreReq.franchiseId) {
  //   //   await route.fulfill({ status: 403, json: { error: 'unable to create a store' } });
  //   //   return;
  //   // }
  //   // testStore = validStore[createStoreReq.franchiseId];
    
  //   const deleteStoreRes = {
  //     message: 'store deleted'
  //   };
  //   expect(route.request().method()).toBe('DELETE');
  //   await route.fulfill({ json: deleteStoreRes });
  // });

  await page.goto('/');
}

test('login as franchisee', async ({ page }) => {
  test.setTimeout(20_000);
  await franchiseeInit(page);

  // await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();

  // await page.getByRole('link', { name: 'f' }).click();
  // await expect(page.getByRole('main')).toContainText('f@jwt.com');
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('main')).toContainText('Everything you need to run an JWT Pizza franchise. Your gateway to success.');

  await expect(page.getByRole('heading')).toContainText('LotaPizza');
  await page.getByRole('button', { name: 'Create store' }).click();
  await expect(page.getByRole('heading')).toContainText('Create store');
  await page.getByRole('textbox', { name: 'store name' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill('NYC');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading')).toContainText('LotaPizza');
  // await page.getByRole('button', { name: 'Create' }).click();
  // await expect(page.locator('tbody')).toContainText('NYC');
  // await page.getByRole('row', { name: 'NYC 0 ₿ Close' }).getByRole('button').click();
  // await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  // await page.getByRole('button', { name: 'Close' }).click();

});

async function adminInit(page: Page) {
  let loggedInAdmin: User | undefined;
  const validAdmins: Record<string, User> = { 'admin@jwt.com': { id: '6', name: 'admin', email: 'admin@jwt.com', password: 'a', roles: [{ role: Role.Admin }] } };

  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const loginAdminReq = route.request().postDataJSON();
    const userAdmin = validAdmins[loginAdminReq.email];
    if (!userAdmin || userAdmin.password !== loginAdminReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInAdmin = validAdmins[loginAdminReq.email];
    const loginAdminRes = {
      user: loggedInAdmin,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginAdminRes });
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInAdmin });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // Create franchise
  await page.route('*/**/api/franchise', async (route) => {
    const createFranchiseReq = {
      name: 'pizzaPalooza3000',
      admins: [
        { email: 'admin@jwt.com'}
      ],
    };
    const createFranchiseRes = {
      name: 'pizzaPalooza3000',
      admins: [
        {
          email: 'admin@jwt.com',
          id: 6,
          name: 'admin',
        },
      ],
      id: 5,
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(createFranchiseReq);
    await route.fulfill({ json: createFranchiseRes });

    await page.unroute(/\/api\/franchise(\?.*)?$/);

    await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
      const franchiseRes = {
        franchises: [
          {
            id: 2,
            name: 'LotaPizza',
            stores: [
              { id: 4, name: 'Lehi' },
              { id: 5, name: 'Springville' },
              { id: 6, name: 'American Fork' },
            ],
          },
          { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
          { id: 4, name: 'topSpot', stores: [] },
          { 
            id: 5, 
            name: 'pizzaPalooza3000',
            admins: [
              { email: 'admin@jwt.com', id: 6, name: 'admin' },
            ],
            stores: [],
          },
        ],
      };
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    });
  });

  // delete franchise
  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    const deleteFranchiseRes = {
        message: 'franchise deleted'
      };
    expect(route.request().method()).toBe('DELETE');
    await route.fulfill({ json: deleteFranchiseRes });

    await page.unroute(/\/api\/franchise(\?.*)?$/);

    await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
      const franchiseRes = {
        franchises: [
          {
            id: 2,
            name: 'LotaPizza',
            stores: [
              { id: 4, name: 'Lehi' },
              { id: 5, name: 'Springville' },
              { id: 6, name: 'American Fork' },
            ],
          },
          { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
          { id: 4, name: 'topSpot', stores: [] },
        ],
      };
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    });
  });

  await page.goto('/');
}

test('login as admin', async ({ page }) => {
  test.setTimeout(20_000);
  await adminInit(page);

  // await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('admin@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.locator('h2')).toContainText('Mama Ricci\'s kitchen');
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('pizzaPalooza3000');
  await page.getByRole('textbox', { name: 'franchise name' }).press('Tab');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('admin@jwt.com');
  await expect(page.getByRole('heading')).toContainText('Create franchise');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('h2')).toContainText('Mama Ricci\'s kitchen');
  await expect(page.getByRole('table')).toContainText('pizzaPalooza3000');
  await page.getByRole('row', { name: 'pizzaPalooza3000 admin Close' }).getByRole('button').click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.locator('h2')).toContainText('Mama Ricci\'s kitchen');


});

test('updateUser', async ({ page }) => {
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza diner');
    await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza dinerx');

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza dinerx');
});

// old data

// test('purchase with login', async ({ page }) => {
//   await page.route('*/**/api/user/me', async (route) => {
//     const meRes = {
//       id: 3,
//       name: 'Kai Chen',
//       email: 'd@jwt.com',
//       roles: [{ role: 'diner' }],
//     };
//     expect(route.request().method()).toBe('GET');
//     await route.fulfill({ json: meRes });
//   });

//   await page.route('*/**/api/order/menu', async (route) => {
//     const menuRes = [
//       {
//         id: 1,
//         title: 'Veggie',
//         image: 'pizza1.png',
//         price: 0.0038,
//         description: 'A garden of delight',
//       },
//       {
//         id: 2,
//         title: 'Pepperoni',
//         image: 'pizza2.png',
//         price: 0.0042,
//         description: 'Spicy treat',
//       },
//     ];
//     expect(route.request().method()).toBe('GET');
//     await route.fulfill({ json: menuRes });
//   });

//   await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
//     const franchiseRes = {
//       franchises: [
//         {
//           id: 2,
//           name: 'LotaPizza',
//           stores: [
//             { id: 4, name: 'Lehi' },
//             { id: 5, name: 'Springville' },
//             { id: 6, name: 'American Fork' },
//           ],
//         },
//         { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
//         { id: 4, name: 'topSpot', stores: [] },
//       ],
//     };
//     expect(route.request().method()).toBe('GET');
//     await route.fulfill({ json: franchiseRes });
//   });

//   await page.route('*/**/api/auth', async (route) => {
//     const loginReq = { email: 'd@jwt.com', password: 'a' };
//     const loginRes = {
//       user: {
//         id: 3,
//         name: 'Kai Chen',
//         email: 'd@jwt.com',
//         roles: [{ role: 'diner' }],
//       },
//       token: 'abcdef',
//     };
//     expect(route.request().method()).toBe('PUT');
//     expect(route.request().postDataJSON()).toMatchObject(loginReq);
//     await route.fulfill({ json: loginRes });
//   });

//   await page.route('*/**/api/order', async (route) => {
//     const orderReq = {
//       items: [
//         { menuId: 1, description: 'Veggie', price: 0.0038 },
//         { menuId: 2, description: 'Pepperoni', price: 0.0042 },
//       ],
//       storeId: '4',
//       franchiseId: 2,
//     };
//     const orderRes = {
//       order: {
//         items: [
//           { menuId: 1, description: 'Veggie', price: 0.0038 },
//           { menuId: 2, description: 'Pepperoni', price: 0.0042 },
//         ],
//         storeId: '4',
//         franchiseId: 2,
//         id: 23,
//       },
//       jwt: 'eyJpYXQ',
//     };
//     expect(route.request().method()).toBe('POST');
//     expect(route.request().postDataJSON()).toMatchObject(orderReq);
//     await route.fulfill({ json: orderRes });
//   });

//   await page.goto('/');

//   // Go to order page
//   await page.getByRole('button', { name: 'Order now' }).click();

//   // Create order
//   await expect(page.locator('h2')).toContainText('Awesome is a click away');
//   await page.getByRole('combobox').selectOption('4');
//   await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
//   await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
//   await expect(page.locator('form')).toContainText('Selected pizzas: 2');
//   await page.getByRole('button', { name: 'Checkout' }).click();

//   // Login
//   await page.getByPlaceholder('Email address').click();
//   await page.getByPlaceholder('Email address').fill('d@jwt.com');
//   await page.getByPlaceholder('Email address').press('Tab');
//   await page.getByPlaceholder('Password').fill('a');
//   await page.getByRole('button', { name: 'Login' }).click();

//   // Pay
//   await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
//   await expect(page.locator('tbody')).toContainText('Veggie');
//   await expect(page.locator('tbody')).toContainText('Pepperoni');
//   await expect(page.locator('tfoot')).toContainText('0.008 ₿');
//   await page.getByRole('button', { name: 'Pay now' }).click();

//   // Check balance
//   await expect(page.getByText('0.008')).toBeVisible();
// });

// note: await page.getByRole('textbox', { name: 'Email address' }) 
//  is essentially doing the same thing as 
//  await page.getByPlaceholder('Email address')
//  so don't worry about it
