"use client";

import { Box, Button, Container, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useState } from "react";
import AuthGate from "@/components/AuthGate";

export const dynamic = "force-dynamic";

export default function HomepagePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Placeholder images - replace with actual images later
  const carouselImages = [
    "https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=Ethics+in+Action",
    "https://via.placeholder.com/800x400/7B68EE/FFFFFF?text=Moral+Reasoning",
    "https://via.placeholder.com/800x400/50C878/FFFFFF?text=Ethical+Dilemmas",
    "https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Philosophy+Practice"
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        background:
          "linear-gradient(to bottom, white 0%, white 6%, #abd8ff 100%)",
      }}
    >
      <AuthGate>
        <Box sx={{ py: 6, textAlign: "center", position: "relative" }}>
          {/* Decorative background shapes - more prominent */}
          <Box
            sx={{
              position: "absolute",
              top: -40,
              left: -40,
              width: "300px",
              height: "300px",
              background: "linear-gradient(135deg, rgba(171, 216, 255, 0.8) 0%, rgba(171, 216, 255, 0.4) 100%)",
              borderRadius: "50%",
              filter: "blur(60px)",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 50,
              right: -50,
              width: "250px",
              height: "250px",
              background: "linear-gradient(135deg, rgba(123, 104, 238, 0.6) 0%, rgba(123, 104, 238, 0.3) 100%)",
              borderRadius: "50%",
              filter: "blur(45px)",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 150,
              left: "5%",
              width: "200px",
              height: "200px",
              background: "linear-gradient(135deg, rgba(80, 200, 120, 0.5) 0%, rgba(80, 200, 120, 0.2) 100%)",
              borderRadius: "50%",
              filter: "blur(40px)",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 300,
              right: "10%",
              width: "280px",
              height: "280px",
              background: "linear-gradient(135deg, rgba(255, 107, 107, 0.4) 0%, rgba(255, 107, 107, 0.2) 100%)",
              borderRadius: "50%",
              filter: "blur(50px)",
              zIndex: 0,
            }}
          />

          {/* Visible Dots Pattern */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(171, 216, 255, 0.6) 2px, transparent 2px),
                radial-gradient(circle at 80% 20%, rgba(123, 104, 238, 0.5) 1.5px, transparent 1.5px),
                radial-gradient(circle at 40% 70%, rgba(80, 200, 120, 0.4) 1px, transparent 1px),
                radial-gradient(circle at 70% 80%, rgba(255, 107, 107, 0.4) 1.5px, transparent 1.5px),
                radial-gradient(circle at 15% 60%, rgba(171, 216, 255, 0.3) 1px, transparent 1px),
                radial-gradient(circle at 90% 50%, rgba(123, 104, 238, 0.3) 2px, transparent 2px),
                radial-gradient(circle at 60% 15%, rgba(80, 200, 120, 0.5) 1px, transparent 1px),
                radial-gradient(circle at 30% 90%, rgba(255, 107, 107, 0.3) 1.5px, transparent 1.5px)
              `,
              backgroundSize: "100px 100px, 150px 150px, 120px 120px, 180px 180px, 90px 90px, 160px 160px, 110px 110px, 140px 140px",
              zIndex: 0,
              opacity: 0.7,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            {/* Welcome message */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontSize: "3.5rem",
              fontWeight: 400,
              fontFamily: "Georgia, 'Times New Roman', Times, serif",
              color: "#2c3e50",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              fontStyle: "italic",
              mb: 1,
            }}
          >
            Welcome to Ethics Bowl Academy
          </Typography>

          <Typography
            variant="h6"
            component="p"
            sx={{
              fontSize: "1.25rem",
              fontWeight: 300,
              fontFamily: "Georgia, 'Times New Roman', Times, serif",
              color: "#4a5568",
              letterSpacing: "0.01em",
              lineHeight: 1.3,
              mb: 3,
            }}
          >
            Built by the Parr Center for Ethics in collaboration with TED-Ed
          </Typography>

          {/* Motivation and value blurb */}
          <Box sx={{ my: 4, maxWidth: 720, mx: "auto" }}>
            <Typography
              variant="body1"
              sx={{
                color: "#1a202c",
                lineHeight: 1.6,
                fontSize: "1.125rem",
                fontFamily: "Georgia, 'Times New Roman', Times, serif",
                mb: 3,
                fontWeight: 400,
                textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
              }}
            >
              Develop critical thinking and ethical reasoning skills through competitive debate preparation, interactive learning modules, and structured philosophical discourse.
            </Typography>

            {/* Image Carousel */}
            <Box
              sx={{
                position: "relative",
                maxWidth: "800px",
                width: "100%",
                mx: "auto",
                mb: 3,
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box
                component="img"
                src={carouselImages[currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                sx={{
                  width: "100%",
                  height: "400px",
                  objectFit: "cover",
                  transition: "opacity 0.3s ease-in-out",
                }}
              />

              {/* Previous Button */}
              <IconButton
                onClick={prevSlide}
                sx={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: "#2c3e50",
                  width: 48,
                  height: 48,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    transform: "translateY(-50%) scale(1.1)",
                  },
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  transition: "all 0.2s ease",
                }}
              >
                <ChevronLeft sx={{ fontSize: 28 }} />
              </IconButton>

              {/* Next Button */}
              <IconButton
                onClick={nextSlide}
                sx={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: "#2c3e50",
                  width: 48,
                  height: 48,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    transform: "translateY(-50%) scale(1.1)",
                  },
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  transition: "all 0.2s ease",
                }}
              >
                <ChevronRight sx={{ fontSize: 28 }} />
              </IconButton>

              {/* Dot Indicators */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 1,
                }}
              >
                {carouselImages.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: index === currentSlide
                        ? "rgba(255, 255, 255, 0.9)"
                        : "rgba(255, 255, 255, 0.5)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        transform: "scale(1.2)",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Three horizontally aligned sections */}
          <Box
            sx={{
              mt: 4,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              justifyContent: "center",
              alignItems: "stretch",
            }}
          >
            {/* Section 1: Get Learning */}
            <Box
              sx={{
                flex: 1,
                maxWidth: 360,
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 500,
                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                  color: "#2c3e50",
                  letterSpacing: "0.01em",
                }}
              >
                Get Learning
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Jump into modules and start exploring. Button links to the
                modules page.
              </Typography>
              <Button variant="contained">Get Learning</Button>
            </Box>

            {/* Section 2: Ethics Bowl Academy */}
            <Box
              sx={{
                flex: 1,
                maxWidth: 360,
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 500,
                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                  color: "#2c3e50",
                  letterSpacing: "0.01em",
                }}
              >
                Ethics Bowl Academy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Blurb about information about the Ethics Bowl Academy. Designed
                to link to another page with more information.
              </Typography>
              <Button variant="outlined">Learn More</Button>
            </Box>

            {/* Section 3: Module Features */}
            <Box
              sx={{
                flex: 1,
                maxWidth: 360,
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 500,
                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                  color: "#2c3e50",
                  letterSpacing: "0.01em",
                }}
              >
                Module Features
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#4a5568",
                  textAlign: "center",
                  lineHeight: 1.5,
                  mb: 2,
                }}
              >
                Interactive videos, knowledge quizzes, digital flashcards, and reflective writing prompts.
              </Typography>

              {/* TED-Ed Partnership */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#4a5568",
                    fontStyle: "italic",
                    fontSize: "0.875rem",
                  }}
                >
                  Powered by
                </Typography>
                <Box
                  component="img"
                  src="/teded.png"
                  alt="TED-Ed"
                  sx={{
                    height: "32px",
                    width: "auto",
                    opacity: 0.8,
                    transition: "opacity 0.2s ease",
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
          </Box>
        </Box>
      </AuthGate>
    </Container>
  );
}
