describe('index test', () => {
  it('passes', () => {
    cy.visit('/').contains('Awarded Grants');
    cy.visit('/').contains('Miscellaneous');
  })
})