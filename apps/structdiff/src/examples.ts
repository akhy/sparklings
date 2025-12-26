export interface ExampleData {
  left: string
  right: string
  name: string
}

export const examples: ExampleData[] = [
  {
    name: 'API Response Comparison',
    left: `# API Response - Version 1
apiVersion: v1
status: success
timestamp: "2024-01-15T10:30:00Z"
requestId: "abc-123"

# Identical values
service: user-service
region: us-east-1

# User data
user:
  id: 12345
  name: "John Doe"
  email: "john@example.com"
  roles:
    - admin
    - developer
  settings:
    theme: dark
    language: en
    notifications: true

# List of objects
orders:
  - id: 1
    product: "Laptop"
    quantity: 2
    price: 999.99
  - id: 2
    product: "Mouse"
    quantity: 1
    price: 29.99

# Tags (same values, different order)
tags:
  - production
  - monitoring
  - critical

# Permissions (identical values and order)
permissions:
  - read
  - write
  - execute`,
    right: `# API Response - Version 2
apiVersion: v1
status: success
timestamp: "2024-01-15T11:45:00Z"
requestId: "xyz-789"

# Identical values
service: user-service
region: us-east-1

# User data (modified email)
user:
  id: 12345
  name: "John Doe"
  email: "john.doe@example.com"
  roles:
    - developer
    - admin
  settings:
    theme: light
    language: en
    notifications: true

# List of objects (added new order)
orders:
  - id: 1
    product: "Laptop"
    quantity: 2
    price: 999.99
  - id: 2
    product: "Mouse"
    quantity: 1
    price: 29.99
  - id: 3
    product: "Keyboard"
    quantity: 1
    price: 79.99

# Tags (different order)
tags:
  - critical
  - monitoring
  - production

# Permissions (identical values and order)
permissions:
  - read
  - write
  - execute`,
  },
]

export function getExample(index: number = 0): ExampleData {
  return examples[index] || examples[0]
}
