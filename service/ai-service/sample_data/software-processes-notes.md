# Software Processes

A software process is a structured set of activities used to develop a software system. Every process includes four fundamental activities: specification, design and implementation, validation, and evolution. A process model is an abstract representation of a process that describes how these activities are organised.

## The Waterfall Model

The waterfall model is a plan-driven model with separate, distinct phases: requirements definition, system and software design, implementation and unit testing, integration and system testing, and operation and maintenance. In principle, one phase must be finished before the next phase starts.

The main drawback of the waterfall model is the difficulty of accommodating change once the process is underway. It fits projects whose requirements are well understood and unlikely to change, and large systems engineering projects developed at several sites, where a plan helps coordinate the work.

## Incremental Development

In incremental development, specification, development and validation are interleaved. The system is delivered as a series of versions, and each version adds functionality to the previous one.

Incremental development lowers the cost of accommodating changing requirements, makes it easier to get customer feedback, and allows useful software to be delivered earlier. Its problems are that the process is not very visible to managers and that the system structure tends to degrade as new increments are added, so regular refactoring is needed.

## Reuse-Oriented Development

Reuse-oriented development builds systems by integrating existing components or application systems, such as commercial off-the-shelf (COTS) products, component frameworks and web services. It reduces cost and risk and speeds up delivery, but requirements compromises are often unavoidable and the team loses control over how the reused elements evolve.

## Verification and Validation

Verification asks whether we are building the product right, that is, whether the system conforms to its specification. Validation asks whether we are building the right product, that is, whether the system meets the real needs of the customer.

Testing usually happens in three stages. Component testing checks individual components independently. System testing checks the system as a whole. Acceptance testing checks the system with data supplied by the customer.

## Process Improvement and CMMI

Process improvement aims to raise software quality, reduce cost or shorten development time. It follows a cycle of process measurement, process analysis and process change.

The Capability Maturity Model Integration (CMMI) defines five maturity levels: Initial, Managed, Defined, Quantitatively Managed and Optimizing. At the Initial level the process is essentially uncontrolled, while at the Optimizing level process improvement strategies are defined and used.
