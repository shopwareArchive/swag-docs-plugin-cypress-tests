// / <reference types="Cypress" />

describe('PluginCypressTests: Test configuration', () => {
    beforeEach(() => {
        cy.loginViaApi()
            .then(() => {
                cy.visit('/admin#/sw/plugin/index/list');
            });
    });

    it('edit plugin\'s configuration', () => {
        // Request we want to wait for later
        cy.server();
        cy.route({
            url: '/api/v1/_action/system-config/batch',
            method: 'post'
        }).as('saveData');

        // Open plugin configuration
        cy.get('.sw-grid__row--0 .sw-plugin-table-entry__title')
            .contains('Label for the plugin PluginCypressTests');

        cy.get('.sw-grid__row--0').should('be.visible');
        cy.get('.sw-grid__row--0 .sw-context-button__button').click({force: true});
        cy.get('.sw-context-menu').should('be.visible');
        cy.get('.sw-context-menu-item:nth-of-type(2)').click();
        cy.get('.sw-context-menu').should('not.exist');

        // Edit configuration and save
        cy.get('input[name="PluginCypressTests.config.example"]').type('Typed using an E2E test');
        cy.get('.sw-plugin-config__save-action').click();

        cy.get('.sw-notifications__notification--0 .sw-alert__message').should('be.visible')
            .contains('Die Konfiguration wurde erfolgreich gespeichert');
    });
});
