describe('ID Cards & Certificates Management', () => {
  beforeEach(() => {
    cy.visit('/institute/login')
  })

  it('Creates, Updates, and Deletes an ID Card Template', () => {
    cy.visit('/institute/id-card-generator/design')
    
    // Add ID Card
    cy.get('button').contains('Create New Template').click()
    cy.get('input[name="templateName"]').type('Cypress ID Card')
    cy.get('button').contains('Save Design').click()
    cy.contains('Cypress ID Card').should('exist')

    // Delete ID Card
    cy.contains('Cypress ID Card').parent().find('button[title="Delete"]').click()
    cy.contains('Cypress ID Card').should('not.exist')
  })

  it('Creates, Updates, and Deletes a Certificate', () => {
    cy.visit('/institute/certificates-generator/design')
    
    // Add Certificate
    cy.get('button').contains('Create New Certificate').click()
    cy.get('input[name="certificateTitle"]').type('Cypress Certificate')
    cy.get('button').contains('Save').click()
    cy.contains('Cypress Certificate').should('exist')

    // Delete Certificate
    cy.contains('Cypress Certificate').parent().find('button[title="Delete"]').click()
    cy.contains('Cypress Certificate').should('not.exist')
  })
})
