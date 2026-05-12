describe('Create New Module Flow', () => {
  it('should allow a teacher to create a new module successfully', () => {
    // Visit login page
    cy.visit('http://localhost:3000');

    // Login as teacher
    cy.get('[data-cy=login-email]').type('T12');
    cy.get('[data-cy=register-password]').type('123456');
    cy.get('[data-cy=register-submit]').click();

    //Go to modules
    cy.get('[data-cy=modules-option]').click();



    // Create new module flow (same as before)
    cy.get('[data-cy=new-module-btn]').click();
    cy.get('[data-cy=module-name-input]').type('Mathematics 101');
    cy.get('[data-cy=module-description-input]').type('Basic Algebra & Geometry');
    cy.get('[data-cy=create-module-submit]').click();

    // Verify module added in UI
    cy.get('[data-cy=module-list]')
      .should('contain.text', 'Mathematics 101')
      .and('contain.text', 'Basic Algebra & Geometry');
  });
});
