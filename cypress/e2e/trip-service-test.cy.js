describe("test", () => {
  it("tests test", () => {
    cy.viewport(1207, 763);
    cy.visit("http://localhost:4200/login");

    // Login como manager
    cy.get("ul.ms-auto > li:nth-of-type(1) > a").click();
    cy.get("#email").type("manager@manager.com");
    cy.get("#pwd").type("manager");
    cy.get("app-login button").click();

    // Esperar que el login sea exitoso
    cy.url().should("not.include", "/login");

    // Navegar al formulario de crear viaje
    cy.get("ul.me-auto > li:nth-of-type(1) > a").should("be.visible").click();
    cy.get("li:nth-of-type(5) > a").should("be.visible").click();

    // Llenar el formulario de viaje
    cy.get("#title").type("Trip de Prueba");
    cy.get("#description").type("Prueba");
    cy.get("#startDate").type("2025-06-02");
    cy.get("#endDate").type("2025-06-20");
    cy.get("div.mt-3 > div").click();
    cy.get("div:nth-of-type(4) > button").click();

    // Añadir stage
    cy.get("#title0").type("Stage 1");
    cy.get("#description0").type("Description for Stage 1");
    cy.get("#price0").type("60");

    // Añadir requerimiento
    cy.get("div:nth-of-type(5) button").click();
    cy.get("div:nth-of-type(5) input").type("Gafas de sol");

    // Publicar
    cy.contains("button", "Create Trip", { timeout: 10000 }).should("be.visible").click();

    // Verificar que el viaje fue creado correctamente (espera de 5 segundos)
    cy.wait(5000); // Asegura que el viaje se haya guardado
    cy.url().should("include", "/trips"); // Verificar la URL para asegurarse que se redirige

    // Cerrar sesión
    cy.get("#navbarNav img").click();
    cy.get("#navbarNav > div li:nth-of-type(2) > a").click();

    // Login como explorer
    cy.get("#email").clear().type("explorer@explorer.com");
    cy.get("#pwd").clear().type("explorer");
    cy.get("app-login button").click();

    // Buscar el viaje creado
    cy.wait(15000); // espera para asegurarse de que los resultados se cargan
    cy.get("input").type("Trip de Prueba{enter}");
    cy.wait(3000)
    // Esperar a que se cargue al menos un resultado con imagen
    cy.get("app-trip-list img", { timeout: 20000 })
      .first()
      .should("be.visible")
      .click();

    // Aplicar
    cy.get("#comments", { timeout: 10000 }).should("be.visible");
    cy.get("#comments").first().should("be.visible").type("Aplicación de prueba");
    cy.get("div > div.container button").click();

    // Volver al panel y cerrar sesión como manager
    cy.get("#navbarNav > div > a").click();
    cy.get("#navbarNav > div li:nth-of-type(2) > a").click();
    cy.get("#email").type("manager@manager.com");
    cy.get("#pwd").type("manager");
    cy.get("app-login button").click();
    cy.wait(20000);
    // Asegúrate de que la sección del viaje esté visible
    cy.get("div.row p.mb-1", { timeout: 10000 })
      .first()
      .should("be.visible")
      .click();

    // Eliminar el viaje
    cy.get("button.btn-danger").click();
  });
});
