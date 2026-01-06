'use client'

import { usePathname } from 'next/navigation'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
} from '@mui/material'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'My Forms', href: '/forms' },
]

/**
 * Premium navigation bar with glassmorphism effect
 * Features animated gradient logo and subtle depth
 */
export function NavBar() {
  const pathname = usePathname()

  const isActive = (href: string): boolean => {
    if (href === '/forms') {
      return pathname === '/forms' || pathname.startsWith('/forms/')
    }
    return pathname === href
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: (theme) => theme.zIndex.appBar,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Logo / App Name with Gradient */}
          <Link href="/forms" style={{ textDecoration: 'none' }}>
            <Typography
              component="span"
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: '1.5rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textDecoration: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  filter: 'brightness(1.1)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: 0,
                  width: '100%',
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
                  transform: 'scaleX(0)',
                  transition: 'transform 0.3s ease',
                },
                '&:hover::after': {
                  transform: 'scaleX(1)',
                },
              }}
            >
              FORMFORGE
            </Typography>
          </Link>

          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </Container>
    </AppBar>
  )
}
