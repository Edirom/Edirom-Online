<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs"
    version="2.0">
    
    <xsl:output encoding="UTF-8" indent="yes" method="xml"/>
    
    <xsl:param name="selectionId"/>
    <xsl:param name="subtreeRoot"/>
    
    <xsl:template match="/">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="*">
        <xsl:choose>
            <xsl:when test=".[@xml:id=$selectionId] or (.//*[@xml:id=$selectionId] and local-name(.) = $subtreeRoot and not(.//*[local-name(.)=$subtreeRoot]))">
                <xsl:copy-of select="."/>
            </xsl:when>
            <xsl:when test=".//*[@xml:id=$selectionId]">
                <xsl:copy>
                    <xsl:apply-templates select="@* | node()"/>
                </xsl:copy>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="@*">
        <xsl:copy/>
    </xsl:template>
    
    <xsl:template match="text() | comment() | processing-instruction()">
        <xsl:copy/>
    </xsl:template>
    
</xsl:stylesheet>