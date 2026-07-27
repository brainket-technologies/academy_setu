describe('Fee Setup & Management', () => {
  beforeEach(() => {
    cy.visit('/institute/login')
    // cy.get('input[name="email"]').type('admin@example.com')
    // cy.get('input[name="password"]').type('password')
    // cy.get('button[type="submit"]').click()
  })

  it('Creates, Updates, and Deletes a Class Fee', () => {
    cy.visit('/institute/fees-setup/class-fee')
    
    // Add Fee
    cy.get('button').find('svg.lucide-plus').parent().click()
    cy.get('select').first().select('Class V') // Dynamic class from masters
    cy.get('input[placeholder="Enter Amount"]').first().type('5000')
    cy.get('button').contains('Save').click()
    cy.contains('5000').should('exist')

    // Update Fee
    cy.get('button[title="Edit"]').first().click()
    cy.get('input[placeholder="Enter Amount"]').first().clear().type('6000')
    cy.get('button').contains('Save').click()
    cy.contains('6000').should('exist')

    // Delete Fee
    cy.get('button[title="Delete"]').first().click()
    // cy.get('button').contains('Confirm').click() 
    cy.contains('6000').should('not.exist')
  })
})
