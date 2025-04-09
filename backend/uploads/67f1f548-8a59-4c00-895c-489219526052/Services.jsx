import React from 'react';
import styled from 'styled-components';

const ServicesSection = styled.section`
  padding: 60px 0;
  background-color: #f4f4f4;
`;

const ServiceCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin: 20px;
`;

const ServicesTitle = styled.h2`
  text-align: center;
  margin-bottom: 40px;
`;

const Services = () => {
  return (
    <ServicesSection>
      <ServicesTitle>Our Services</ServicesTitle>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <ServiceCard>
          <h3>Service 1</h3>
          <p>Description of Service 1.</p>
        </ServiceCard>
        <ServiceCard>
          <h3>Service 2</h3>
          <p>Description of Service 2.</p>
        </ServiceCard>
        <ServiceCard>
          <h3>Service 3</h3>
          <p>Description of Service 3.</p>
        </ServiceCard>
      </div>
    </ServicesSection>
  );
};

export default Services;
