const services = [
    {
      id: 1,
      name: "Nail trimming",
      description: "Quick nail trim to keep your pet's nails neat and comfortable.",
      durationMinutes: 10,
      priority: "low",
      active: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Haircut",
      description: "Professional haircut tailored to your pet’s breed and style preference.",
      durationMinutes: 30,
      priority: "medium",
      active: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Full Groom (Bath + Haircut + Nails)",
      description: "Complete grooming package including bath, haircut, and nail trim.",
      durationMinutes: 60,
      priority: "high",
      active: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: "Bath + Dry",
      description: "Bath, shampoo, blow dry, and brushing.",
      durationMinutes: 35,
      priority: "medium",
      active: true,
      updatedAt: new Date().toISOString(),
    },
  ];
  
  module.exports = services;