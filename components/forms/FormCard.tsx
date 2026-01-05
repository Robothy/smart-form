'use client'

import { Card, CardContent, CardActions, Typography, Chip, Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import { FormStatusBadge } from './FormStatusBadge'
import { ShareIconButton } from './ShareIconButton'
import { Button } from '@/components/ui/Button'

export interface FormCardProps {
  id: string
  title: string
  status: 'draft' | 'published'
  description?: string
  fieldsCount: number
  submissionsCount: number
  shareableLink?: string
  slug?: string | null
  onClick: () => void
}

export function FormCard({
  id,
  title,
  status,
  description,
  fieldsCount,
  submissionsCount,
  shareableLink,
  slug,
  onClick,
}: FormCardProps) {
  const router = useRouter()
  const isPublished = status === 'published'

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPublished) {
      router.push(`/forms/${id}/submissions`)
    } else {
      router.push(`/forms/${id}/edit`)
    }
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormStatusBadge status={status} />
            <ShareIconButton
              slug={slug || null}
              shareUrl={shareableLink || null}
              formStatus={status}
            />
          </Box>
        </Box>

        {description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {description}
          </Typography>
        )}

        <Box sx={{ mt: 2 }}>
          <Chip label={`${fieldsCount} field${fieldsCount !== 1 ? 's' : ''}`} size="small" sx={{ mr: 1 }} />
          <Chip
            label={`${submissionsCount} submission${submissionsCount !== 1 ? 's' : ''}`}
            size="small"
            color={submissionsCount > 0 ? 'primary' : 'default'}
          />
        </Box>
      </CardContent>

      <CardActions>
        <Button fullWidth variant="outlined" onClick={handleButtonClick}>
          {isPublished ? 'View Submissions' : 'Edit Form'}
        </Button>
      </CardActions>
    </Card>
  )
}
