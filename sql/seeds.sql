USE busconnect;

INSERT IGNORE INTO drivers (voornaam, achternaam, email, telefoon, ervaring, voertuig, capaciteit, route, school, prijs)
VALUES
('Jan','Smit','jan@example.com','+5970000001',5,'Minibus',8,'Noord','O.S. Flora',150),
('Maria','de Vries','maria@example.com','+5970000002',3,'Schoolbus',12,'Zuid','HAVO',180);
