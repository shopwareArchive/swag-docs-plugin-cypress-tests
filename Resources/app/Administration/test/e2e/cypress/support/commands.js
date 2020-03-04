// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/**
 * Switches administration UI locale to EN_GB
 * @memberOf Cypress.Chainable#
 * @name setLocaleToEnGb
 * @function
 */
Cypress.Commands.add('setLocaleToEnGb', () => {
    return cy.window().then((win) => {
        win.localStorage.setItem('sw-admin-locale', Cypress.env('locale'));
    });
});

/**
 * Cleans up any previous state by restoring database and clearing caches
 * @memberOf Cypress.Chainable#
 * @name openInitialPage
 * @function
 */
Cypress.Commands.add('openInitialPage', (url) => {
    // Request we want to wait for later
    cy.server();
    cy.route('/api/v1/_info/me').as('meCall');


    cy.visit(url);
    cy.wait('@meCall').then(() => {
        cy.get('.sw-desktop').should('be.visible');
    });
});

/**
 * Authenticate towards the Shopware API
 * @memberOf Cypress.Chainable#
 * @name authenticate
 * @function
 */
Cypress.Commands.add('authenticate', () => {
    return cy.request(
        'POST',
        '/api/oauth/token',
        {
            grant_type: Cypress.env('grant') ? Cypress.env('grant') : 'password',
            client_id: Cypress.env('client_id') ? Cypress.env('client_id') : 'administration',
            scopes: Cypress.env('scope') ? Cypress.env('scope') : 'write',
            username: Cypress.env('username') ? Cypress.env('user') : 'admin',
            password: Cypress.env('password') ? Cypress.env('pass') : 'shopware'
        }
    ).then((responseData) => {
        return {
            access: responseData.body.access_token,
            refresh: responseData.body.refresh_token,
            expiry: Math.round(+new Date() / 1000) + responseData.body.expires_in
        };
    });
});

/**
 * Logs in silently using Shopware API
 * @memberOf Cypress.Chainable#
 * @name loginViaApi
 * @function
 */
Cypress.Commands.add('loginViaApi', () => {
    return cy.authenticate().then((result) => {
        return cy.window().then((win) => {
            win.localStorage.setItem('bearerAuth', JSON.stringify(result));
            // Return bearer token
            return win.localStorage.getItem('bearerAuth');
        }, [result], (data) => {
            if (!data.value) {
                cy.login('admin');
            }
        });
    });
});

/**
 * Click context menu in order to cause a desired action
 * @memberOf Cypress.Chainable#
 * @name clickContextMenuItem
 * @function
 * @param {String} menuButtonSelector - The message to look for
 * @param {String} menuOpenSelector - The message to look for
 * @param {Object} [scope=null] - Options concerning the notification
 */
Cypress.Commands.add('clickContextMenuItem', (menuButtonSelector, menuOpenSelector, scope = null) => {
    const contextMenuCssSelector = '.sw-context-menu';
    const activeContextButtonCssSelector = '.is--active';

    if (scope != null) {
        cy.get(scope).should('be.visible');
        cy.get(`${scope} ${menuOpenSelector}`).click({ force: true });

        if (scope.includes('row')) {
            cy.get(`${menuOpenSelector}${activeContextButtonCssSelector}`).should('be.visible');
        }
    } else {
        cy.get(menuOpenSelector).should('be.visible').click({ force: true });
    }

    cy.get(contextMenuCssSelector).should('be.visible');
    cy.get(menuButtonSelector).click();
    cy.get(contextMenuCssSelector).should('not.exist');
});
