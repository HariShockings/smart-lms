import React, { useState } from 'react';
import { HelpCircle, Search, BookOpen, MessageSquare, Phone, Mail, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  articles: number;
}

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());

  const helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Learn the basics of using the platform',
      icon: BookOpen,
      articles: 8,
    },
    {
      id: 'courses',
      name: 'Courses & Learning',
      description: 'Everything about taking and managing courses',
      icon: BookOpen,
      articles: 12,
    },
    {
      id: 'assignments',
      name: 'Assignments & Quizzes',
      description: 'How to submit assignments and take quizzes',
      icon: BookOpen,
      articles: 6,
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Messaging, announcements, and collaboration',
      icon: MessageSquare,
      articles: 4,
    },
    {
      id: 'technical',
      name: 'Technical Support',
      description: 'Browser compatibility and technical issues',
      icon: HelpCircle,
      articles: 10,
    },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I enroll in a course?',
      answer: 'To enroll in a course, navigate to the Courses page, browse available courses, and click the "Enroll" button on any course you\'re interested in. You\'ll need to confirm your enrollment, and then you\'ll have access to all course materials.',
      category: 'courses',
      tags: ['enrollment', 'courses', 'getting-started'],
    },
    {
      id: '2',
      question: 'How do I submit an assignment?',
      answer: 'To submit an assignment, go to your course page, find the assignment in the Assignments section, click on it, and use the submission form to upload your files or enter your answers. Make sure to review your submission before clicking "Submit".',
      category: 'assignments',
      tags: ['assignments', 'submission', 'files'],
    },
    {
      id: '3',
      question: 'What browsers are supported?',
      answer: 'Our platform works best with modern browsers including Chrome (version 90+), Firefox (version 88+), Safari (version 14+), and Edge (version 90+). We recommend keeping your browser updated for the best experience.',
      category: 'technical',
      tags: ['browser', 'compatibility', 'technical'],
    },
    {
      id: '4',
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the login page and click "Forgot Password". Enter your email address, and we\'ll send you a link to reset your password. Make sure to check your spam folder if you don\'t receive the email.',
      category: 'getting-started',
      tags: ['password', 'security', 'account'],
    },
    {
      id: '5',
      question: 'Can I access courses offline?',
      answer: 'Currently, our platform requires an internet connection to access course materials. However, you can download some materials (like PDFs) to view offline. We\'re working on adding offline capabilities in future updates.',
      category: 'courses',
      tags: ['offline', 'download', 'access'],
    },
    {
      id: '6',
      question: 'How do I contact my instructor?',
      answer: 'You can contact your instructor through the Messages feature. Go to the Messages page, find your instructor in the conversations list, or start a new conversation. You can also use the course discussion forums for course-related questions.',
      category: 'communication',
      tags: ['instructor', 'messaging', 'contact'],
    },
    {
      id: '7',
      question: 'What file types can I upload for assignments?',
      answer: 'We accept most common file types including PDF, DOC, DOCX, TXT, JPG, PNG, GIF, and ZIP files. The maximum file size is 50MB per file. If you need to submit larger files, consider compressing them or splitting them into smaller parts.',
      category: 'assignments',
      tags: ['file-types', 'upload', 'size-limits'],
    },
    {
      id: '8',
      question: 'How do I track my progress in a course?',
      answer: 'Your progress is automatically tracked as you complete lessons, assignments, and quizzes. You can view your progress on the course dashboard, which shows completion percentages, grades, and upcoming deadlines.',
      category: 'courses',
      tags: ['progress', 'tracking', 'dashboard'],
    },
  ];

  const toggleFAQ = (faqId: string) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedFAQs(newExpanded);
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      action: 'support@smartlms.com',
      link: 'mailto:support@smartlms.com',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Start Chat',
      link: '#',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us for urgent issues',
      action: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
    },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h3 mb-2 text-dark">Help Center</h1>
        <p className="text-muted">Find answers to common questions and get the support you need</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="input-group" style={{ maxWidth: '672px', margin: '0 auto' }}>
          <span className="input-group-text">
            <Search size={20} className="text-muted" />
          </span>
          <input
            type="text"
            placeholder="Search for help articles, FAQs, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      {/* Help Categories */}
      <div className="mb-5">
        <h2 className="h4 mb-3 text-dark">Browse by Category</h2>
        <div className="row g-3">
          {helpCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => setSelectedCategory(category.id === selectedCategory ? 'all' : category.id)}
              className={`col-md-6 col-lg-4 card border-0 shadow-sm p-3 cursor-pointer ${
                selectedCategory === category.id ? 'border-primary border-2' : ''
              }`}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="rounded bg-primary bg-opacity-10 p-2">
                  <category.icon size={24} className="text-primary" />
                </div>
                <div className="flex-grow-1">
                  <h5 className="mb-1 text-dark">{category.name}</h5>
                  <p className="small text-muted mb-1">{category.description}</p>
                  <p className="small text-muted">{category.articles} articles</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="mb-5">
        <h2 className="h4 mb-3 text-dark">
          Frequently Asked Questions
          {selectedCategory !== 'all' && (
            <span className="h5 text-muted ms-2">
              - {helpCategories.find((c) => c.id === selectedCategory)?.name}
            </span>
          )}
        </h2>
        
        <div className="d-flex flex-column gap-3">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="card border-0 shadow-sm">
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="card-header bg-white d-flex justify-content-between align-items-center p-3 text-start"
              >
                <h5 className="mb-0 text-dark">{faq.question}</h5>
                {expandedFAQs.has(faq.id) ? (
                  <ChevronDown size={20} className="text-muted" />
                ) : (
                  <ChevronRight size={20} className="text-muted" />
                )}
              </button>
              
              {expandedFAQs.has(faq.id) && (
                <div className="card-body">
                  <p className="text-dark mb-2">{faq.answer}</p>
                  <div className="d-flex flex-wrap gap-2">
                    {faq.tags.map((tag) => (
                      <span key={tag} className="badge bg-primary bg-opacity-10 text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-5">
            <HelpCircle size={64} className="text-muted mb-3" />
            <h5 className="mb-2 text-dark">No results found</h5>
            <p className="text-muted">Try adjusting your search terms or browse by category</p>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="mb-5">
        <h2 className="h4 mb-3 text-dark">Still Need Help?</h2>
        <div className="row g-3">
          {contactMethods.map((method, index) => (
            <div key={index} className="col-md-4 card border-0 shadow-sm p-3 text-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 mx-auto mb-2" style={{ width: '64px', height: '64px' }}>
                <method.icon size={32} className="text-primary" />
              </div>
              <h5 className="mb-1 text-dark">{method.title}</h5>
              <p className="small text-muted mb-2">{method.description}</p>
              <a href={method.link} className="d-flex align-items-center justify-content-center gap-2 text-primary">
                {method.action}
                <ExternalLink size={16} />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Quick Links</h5>
        </div>
        <div className="card-body">
          <div className="row g-2">
            {[
              'User Guide',
              'Video Tutorials',
              'System Status',
              'Feature Requests',
              'Privacy Policy',
              'Terms of Service',
              'Accessibility',
              'Contact Us',
            ].map((link, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <a href="#" className="text-primary hover-text-primary-dark">
                  {link}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;