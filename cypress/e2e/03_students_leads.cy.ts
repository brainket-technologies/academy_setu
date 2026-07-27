describe('Students and Leads Management', () => {
  beforeEach(() => {
    cy.visit('/institute/login')
  })

  it('Creates, Updates, and Deletes a Lead', () => {
    cy.visit('/institute/leads')
    
    // Add Lead
    cy.get('button').contains('Add Lead').click()
    cy.get('input[name="studentName"]').type('Cypress Lead')
    cy.get('input[name="mobileNumber"]').type('9999999999')
    cy.get('button').contains('Save').click()
    cy.contains('Cypress Lead').should('exist')

    // Update Lead
    cy.contains('Cypress Lead').parent().find('button[title="Edit"]').click()
    cy.get('input[name="studentName"]').clear().type('Updated Cypress Lead')
    cy.get('button').contains('Save').click()
    cy.contains('Updated Cypress Lead').should('exist')

    // Delete Lead
    cy.contains('Updated Cypress Lead').parent().find('button[title="Delete"]').click()
    cy.contains('Updated Cypress Lead').should('not.exist')
  })

  it('Creates, Updates, and Deletes a Student', () => {
    cy.visit('/institute/students')
    
    // Add Student
    cy.get('a[href="/institute/students/add"]').click()
    cy.get('input[name="firstName"]').type('John')
    cy.get('input[name="lastName"]').type('Cypress')
    cy.get('select[name="class"]').select('Class V') // Assuming dynamic classes are loaded
    cy.get('button').contains('Submit').click()
    
    cy.visit('/institute/students')
    cy.contains('John Cypress').should('exist')

    // Update Student
    cy.contains('John Cypress').parent().find('button[title="Edit"]').click()
    cy.get('input[name="firstName"]').clear().type('Johnny')
    cy.get('button').contains('Save').click()
    
    cy.visit('/institute/students')
    cy.contains('Johnny Cypress').should('exist')

    // Delete Student
    cy.contains('Johnny Cypress').parent().find('button[title="Delete"]').click()
    cy.contains('Johnny Cypress').should('not.exist')
  })
})
