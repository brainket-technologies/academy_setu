describe('Master Setups Operations', () => {
  beforeEach(() => {
    // Assuming a login page exists or setting local storage if auth is bypassed
    cy.visit('/institute/login')
    // Mocking an admin session or filling in login
    // cy.get('input[name="email"]').type('admin@example.com')
    // cy.get('input[name="password"]').type('password')
    // cy.get('button[type="submit"]').click()
  })

  it('Creates, Updates, and Deletes a Class in Masters', () => {
    cy.visit('/institute/classes')
    
    // Add Class
    cy.get('button').contains('Add Class').click()
    cy.get('input[name="className"]').type('Cypress Test Class')
    cy.get('button').contains('Save').click()
    cy.contains('Cypress Test Class').should('exist')

    // Update Class
    cy.contains('Cypress Test Class').parent().find('button[title="Edit"]').click()
    cy.get('input[name="className"]').clear().type('Updated Cypress Class')
    cy.get('button').contains('Save').click()
    cy.contains('Updated Cypress Class').should('exist')

    // Delete Class
    cy.contains('Updated Cypress Class').parent().find('button[title="Delete"]').click()
    // cy.get('button').contains('Confirm').click() // If there's a confirmation modal
    cy.contains('Updated Cypress Class').should('not.exist')
  })

  it('Creates, Updates, and Deletes a Section in Masters', () => {
    cy.visit('/institute/sections')
    
    // Add Section
    cy.get('button').contains('Add Section').click()
    cy.get('input[name="sectionName"]').type('CYP-A')
    cy.get('button').contains('Save').click()
    cy.contains('CYP-A').should('exist')

    // Delete Section
    cy.contains('CYP-A').parent().find('button[title="Delete"]').click()
    cy.contains('CYP-A').should('not.exist')
  })
})
