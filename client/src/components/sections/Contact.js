import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTextSplit } from '../../hooks/useTextSplit';
import MagneticButton from '../animations/MagneticButton';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ContactSection = styled.section`
  padding: 120px 0;
  position: relative;
  background-color: #0a0a0a;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 80px 0;
  }
`;

const ContactContainer = styled.div`
  width: 90%;
  max-width: var(--max-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  position: relative;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const ContactContent = styled.div`
  position: relative;
  z-index: 2;
`;

const SectionTitle = styled.h2`
  font-size: clamp(2.5rem, 4vw, 4rem);
  margin-bottom: 40px;
  overflow: hidden;
`;

const SectionDescription = styled.div`
  color: var(--text-secondary);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  max-width: 500px;
  line-height: 1.8;
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(30px);
  
  p {
    margin-bottom: 20px;
  }
  
  strong {
    color: var(--light);
  }
`;

const ContactInfo = styled.div`
  margin-top: 40px;
  opacity: 0;
  transform: translateY(30px);
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  &:hover .contact-icon {
    color: var(--primary);
  }
`;

const ContactIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 15px;
  color: var(--light);
  transition: color 0.3s ease;
`;

const ContactText = styled.div`
  color: var(--text-secondary);
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--light);
  }
`;

const ContactFormContainer = styled.div`
  position: relative;
  background-color: rgba(30, 30, 30, 0.3);
  border-radius: 16px;
  padding: 40px;
  transform: translateY(50px);
  opacity: 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(179, 139, 252, 0.1), rgba(92, 39, 254, 0.1));
    border-radius: 16px;
    z-index: -1;
  }
`;

const FormTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 30px;
  color: var(--light);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  background-color: rgba(20, 20, 20, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--light);
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(179, 139, 252, 0.2);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  background-color: rgba(20, 20, 20, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--light);
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  transition: border-color 0.3s, box-shadow 0.3s;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(179, 139, 252, 0.2);
  }
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
`;

const GradientBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  
  .gradient-circle {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(179, 139, 252, 0.4) 0%, rgba(92, 39, 254, 0) 70%);
    opacity: 0.1;
  }
  
  .circle-1 {
    width: 800px;
    height: 800px;
    bottom: -400px;
    right: -400px;
  }
  
  .circle-2 {
    width: 600px;
    height: 600px;
    top: -300px;
    left: -300px;
  }
`;

const Contact = () => {
  const titleRef = useTextSplit({ type: 'chars', staggerValue: 0.02 });
  const descriptionRef = useRef(null);
  const contactInfoRef = useRef(null);
  const formRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log('Form submitted:', formData);
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };
  
  useEffect(() => {
    // Animation for description text
    if (descriptionRef.current) {
      gsap.to(descriptionRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: descriptionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }
    
    // Animation for contact info
    if (contactInfoRef.current) {
      gsap.to(contactInfoRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: contactInfoRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }
    
    // Animation for contact form
    if (formRef.current) {
      gsap.to(formRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: formRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }
  }, []);
  
  return (
    <ContactSection id="contact">
      <GradientBackground>
        <div className="gradient-circle circle-1"></div>
        <div className="gradient-circle circle-2"></div>
      </GradientBackground>
      
      <ContactContainer>
        <ContactContent>
          <SectionTitle ref={titleRef}>
            Get in Touch
          </SectionTitle>
          
          <SectionDescription ref={descriptionRef}>
            <p>Have questions about Team-Sync? Ready to transform your team's workflow? Contact us today and discover how we can help you achieve more together.</p>
            <p>Our team is standing by to provide personalized support and solutions tailored to your organization's needs.</p>
          </SectionDescription>
          
          <ContactInfo ref={contactInfoRef}>
            <ContactItem>
              <ContactIcon className="contact-icon">📧</ContactIcon>
              <ContactText>support@teamsync.com</ContactText>
            </ContactItem>
            
            <ContactItem>
              <ContactIcon className="contact-icon">📱</ContactIcon>
              <ContactText>+1 (555) 123-4567</ContactText>
            </ContactItem>
            
            <ContactItem>
              <ContactIcon className="contact-icon">📍</ContactIcon>
              <ContactText>123 Collaboration Avenue, Digital City</ContactText>
            </ContactItem>
          </ContactInfo>
        </ContactContent>
        
        <ContactFormContainer ref={formRef}>
          <FormTitle>Send Us a Message</FormTitle>
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Name</Label>
              <Input 
                type="text" 
                id="name" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                type="text" 
                id="subject" 
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              ></Textarea>
            </FormGroup>
            
            <ButtonContainer>
              <MagneticButton type="submit">
                Send Message
              </MagneticButton>
            </ButtonContainer>
          </form>
        </ContactFormContainer>
      </ContactContainer>
    </ContactSection>
  );
};

export default Contact; 